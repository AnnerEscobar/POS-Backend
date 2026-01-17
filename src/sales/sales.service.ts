import { ProductService } from './../product/product.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Sale, SaleDocument } from './schemas/sale.schema';
import { CreateSaleDto } from './dto/create-sale.dto';
import { FindSalesQueryDto } from './dto/find-sales-query.dto';
import { CashService } from 'src/cash/cash.service';

@Injectable()
export class SalesService {


  constructor(
    @InjectModel(Sale.name)
    private readonly saleModel: Model<SaleDocument>,
    private readonly productService: ProductService,
    private cashService: CashService,
  ) { }

  async create(tenantId: string, userId: string, dto: CreateSaleDto): Promise<Sale> {
    /**
     * Regla de negocio:
     * No se puede registrar venta si no existe una caja abierta.
     */
    const openCash = await this.cashService.getOpenCash(tenantId, userId); // modo PER_USER default
    if (!openCash) {
      throw new BadRequestException('No se puede registrar la venta: no hay una caja abierta para este usuario.');
    }

    // Stock
    const itemsWithProduct = dto.items.filter(it => !!it.productId);
    if (itemsWithProduct.length > 0) {
      await this.productService.decreaseStockBulk(
        tenantId,
        itemsWithProduct.map(it => ({
          productId: it.productId!,
          quantity: it.quantity,
        })),
      );


    }

    /**
     * Guardamos la venta asociada a:
     * - tenantId: aislamiento multi-tenant
     * - userId: auditoría del cajero
     * - cashRegisterId: cierre exacto de caja
     */
    const created = new this.saleModel({
      ...dto,
      tenantId,
      userId,
      cashRegisterId: openCash._id.toString(),
      date: dto.date ?? new Date(),
    });

    return created.save();
  }



  async findAll(tenantId: string, query: FindSalesQueryDto) {
    const filter: FilterQuery<SaleDocument> = { tenantId };

    if (query.from || query.to) {
      filter.date = {};
      if (query.from) {
        filter.date.$gte = new Date(query.from);
      }
      if (query.to) {
        // sumar un día para incluir toda la fecha "to"
        const end = new Date(query.to);
        end.setDate(end.getDate() + 1);
        filter.date.$lt = end;
      }
    }

    const items = await this.saleModel
      .find(filter)
      .sort({ date: -1 })
      .limit(200) // por ahora límite fijo
      .lean()
      .exec();

    return items;
  }

  async findOne(tenantId: string, id: string) {
    return this.saleModel.findOne({ _id: id, tenantId }).exec();
  }
}
