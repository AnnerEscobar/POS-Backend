import { ProductService } from './../product/product.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Sale, SaleDocument } from './schemas/sale.schema';
import { CreateSaleDto } from './dto/create-sale.dto';
import { FindSalesQueryDto } from './dto/find-sales-query.dto';

@Injectable()
export class SalesService {


  constructor(
    @InjectModel(Sale.name)
    private readonly saleModel: Model<SaleDocument>,
    private readonly productService: ProductService,
  ) { }

  async create(dto: CreateSaleDto): Promise<Sale> {
    // 👇 Filtramos solo ítems con productId (ventas “normales”)
    const itemsWithProduct = dto.items.filter(it => !!it.productId);

    if (itemsWithProduct.length > 0) {
      await this.productService.decreaseStockBulk(
        itemsWithProduct.map(it => ({
          productId: it.productId!,
          quantity: it.quantity,
        })),
      );
    }

    const created = new this.saleModel({
      ...dto,
      date: dto.date ?? new Date(),
    });

    return created.save();
  }

  async findAll(query: FindSalesQueryDto) {
    const filter: FilterQuery<SaleDocument> = {};

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

  async findOne(id: string): Promise<Sale | null> {
    return this.saleModel.findById(id).exec();
  }
}
