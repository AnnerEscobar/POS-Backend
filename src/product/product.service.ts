import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { QuickUpdateProductDto } from './dto/update-product.dto';
import {
  FindProductsQueryDto,
  StockStatus,
} from './dto/find-product-query.dto';
import { CategoriesService } from 'src/categories/categories.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly categoriesService: CategoriesService,
  ) { }

  // === CREAR (ya lo tendrás parecido) ===
  async create(createProductDto: CreateProductDto): Promise<Product> {
    const {
      salePrice,
      costPrice,
      code = null,
      category = null,
      description = null,
      ...rest
    } = createProductDto as any;

    // 🔥 Registrar categoría si viene en el DTO
    if (category) {
      await this.categoriesService.findOrCreateByName(category);
    }

    const created = new this.productModel({
      ...rest,
      code,
      category,
      description,
      price: salePrice,
      cost: costPrice,
    });

    return created.save();
  }



  async findAll(queryDto: FindProductsQueryDto) {
    const {
      category,
      stockStatus = StockStatus.ALL,
      search,
      page = 1,
      limit = 20,
    } = queryDto;

    const filter: FilterQuery<ProductDocument> = {};

    // Filtro por categoría
    if (category) {
      filter.category = category;
    }

    // Filtro por estado de stock
    if (stockStatus === StockStatus.LOW) {
      filter.stock = { $in: [1, 2] };
    } else if (stockStatus === StockStatus.OUT) {
      filter.stock = 0;
    }
    // ALL -> no filtramos por stock

    // Búsqueda por nombre (case-insensitive)
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.productModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async quickUpdate(id: string, dto: QuickUpdateProductDto): Promise<Product> {
    return this.productModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
  }

  // Puedes mantener tus otros métodos (findOne, update, remove, etc.)
}
