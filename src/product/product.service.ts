import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { QuickUpdateProductDto } from './dto/QuickUpdateProduct.dto';
import { FindProductsQueryDto, StockStatus } from './dto/find-product-query.dto';
import { CategoriesService } from 'src/categories/categories.service';
import { UpdateProductDto } from './dto/UpdateProduct.dto';
import { normalizeProductName, normalizeDescription } from '../common/text-normalizer';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly categoriesService: CategoriesService,
  ) {}

  /**
   * Crea un producto dentro de un tenant específico.
   * - Normaliza nombre/descripcion
   * - Si viene categoría, la busca o crea dentro del mismo tenant
   * - Mapea salePrice->price y costPrice->cost
   */
  async create(tenantId: string, createProductDto: CreateProductDto): Promise<Product> {
    const {
      salePrice,
      costPrice,
      code = null,
      category = null,
      description = null,
      name,
      showOnline,
      ...rest
    } = createProductDto as any;

    const normalizedName = normalizeProductName(name);
    const normalizedDescription = description ? normalizeDescription(description) : null;

    let normalizedCategory: string | null = null;

    // Categoría (si viene): se resuelve dentro del tenant
    if (category && category.trim() !== '') {
      const cat = await this.categoriesService.findOrCreateByName(tenantId, category);
      normalizedCategory = cat.name; // ya normalizado
    }

    const created = new this.productModel({
      ...rest,
      tenantId, // ✅ multi-tenant
      name: normalizedName,
      code,
      category: normalizedCategory,
      description: normalizedDescription,
      price: salePrice,
      cost: costPrice,
      showOnline: showOnline ?? true, // ✅ default si el front no lo manda
    });

    return created.save();
  }

  /**
   * Lista productos de un tenant con filtros:
   * - category
   * - stockStatus (low/out)
   * - search por nombre
   * - paginación
   */
  async findAll(tenantId: string, queryDto: FindProductsQueryDto) {
    const { category, stockStatus = StockStatus.ALL, search, page = 1, limit = 20 } = queryDto;

    // ✅ Siempre filtrar por tenant
    const filter: FilterQuery<ProductDocument> = { tenantId };

    if (category) {
      filter.category = category;
    }

    if (stockStatus === StockStatus.LOW) {
      filter.stock = { $in: [1, 2] };
    } else if (stockStatus === StockStatus.OUT) {
      filter.stock = 0;
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.productModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.productModel.countDocuments(filter),
    ]);

    return { items, total, page, limit };
  }

  /**
   * Update rápido (stock/precio/costo) limitado al tenant.
   */
  async quickUpdate(tenantId: string, id: string, dto: QuickUpdateProductDto): Promise<Product> {
    const updated = await this.productModel
      .findOneAndUpdate({ _id: id, tenantId }, { $set: dto }, { new: true })
      .exec();

    if (!updated) throw new BadRequestException('Producto no encontrado');
    return updated;
  }

  /**
   * Update general (nombre, descripción, categoría, etc.) limitado al tenant.
   */
  async update(tenantId: string, id: string, dto: UpdateProductDto): Promise<Product> {
    const update: any = { ...dto };

    if (dto.name !== undefined) {
      update.name = normalizeProductName(dto.name);
    }

    if (dto.description !== undefined) {
      update.description =
        dto.description && dto.description.trim() !== ''
          ? normalizeDescription(dto.description)
          : null;
    }

    if (dto.category !== undefined) {
      const raw = dto.category;

      if (!raw || raw.trim() === '') {
        update.category = null;
      } else {
        const cat = await this.categoriesService.findOrCreateByName(tenantId, raw);
        update.category = cat.name;
      }
    }

    // limpiar undefined
    const cleanUpdate: any = {};
    for (const [key, value] of Object.entries(update)) {
      if (value !== undefined) cleanUpdate[key] = value;
    }

    const updated = await this.productModel
      .findOneAndUpdate({ _id: id, tenantId }, { $set: cleanUpdate }, { new: true })
      .exec();

    if (!updated) throw new BadRequestException('Producto no encontrado');
    return updated;
  }

  /**
   * Descuenta stock de un producto dentro del tenant.
   * Se asegura de que haya stock suficiente (operación atómica).
   */
  async decreaseStock(tenantId: string, productId: string, quantity: number): Promise<void> {
    const res = await this.productModel
      .updateOne(
        { _id: productId, tenantId, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
      )
      .exec();

    if (res.matchedCount === 0) {
      throw new BadRequestException('No hay existencias suficientes para este producto');
    }
  }

  /**
   * Descuento en lote.
   * Nota: hoy es secuencial; más adelante se puede mejorar con bulkWrite/transactions si hace falta.
   */
  async decreaseStockBulk(
    tenantId: string,
    items: { productId: string; quantity: number }[],
  ): Promise<void> {
    for (const item of items) {
      await this.decreaseStock(tenantId, item.productId, item.quantity);
    }
  }
}
