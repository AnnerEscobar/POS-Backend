import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { QuickUpdateProductDto } from './dto/QuickUpdateProduct.dto';
import {
  FindProductsQueryDto,
  StockStatus,
} from './dto/find-product-query.dto';
import { CategoriesService } from 'src/categories/categories.service';
import { UpdateProductDto } from './dto/UpdateProduct.dto';
import {
  normalizeCategoryName,
  normalizeProductName,
  normalizeDescription,
} from '../common/text-normalizer';


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
      name,
      ...rest
    } = createProductDto as any;

    const normalizedName = normalizeProductName(name);
    const normalizedDescription = description ? normalizeDescription(description) : null;

    let normalizedCategory: string | null = null;
    if (category && category.trim() !== '') {
      const cat = await this.categoriesService.findOrCreateByName(category);
      normalizedCategory = cat.name; // ya viene normalizado del service
    }

    const created = new this.productModel({
      ...rest,
      name: normalizedName,
      code,
      category: normalizedCategory,
      description: normalizedDescription,
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

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
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
        const cat = await this.categoriesService.findOrCreateByName(raw);
        update.category = cat.name; // normalizada
      }
    }

    // limpiar undefined
    const cleanUpdate: any = {};
    for (const [key, value] of Object.entries(update)) {
      if (value !== undefined) {
        cleanUpdate[key] = value;
      }
    }

    return this.productModel
      .findByIdAndUpdate(id, { $set: cleanUpdate }, { new: true })
      .exec();
  }


  // Puedes mantener tus otros métodos (findOne, update, remove, etc.)
}
