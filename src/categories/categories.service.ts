import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { normalizeCategoryName } from '../common/text-normalizer';


@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) { }

  async findAll(): Promise<Category[]> {
    return this.categoryModel
      .find({ isActive: true })
      .sort({ name: 1 })
      .lean()
      .exec();
  }

  async create(dto: CreateCategoryDto): Promise<Category> {

    const name = normalizeCategoryName(dto.name);
    if (!name) {
      throw new BadRequestException('El nombre de la categoría es requerido');
    }

    const exists = await this.categoryModel
      .findOne({ name })   // ya no hace falta el RegExp con i
      .exec();

    if (exists) {
      throw new BadRequestException('La categoría ya existe');
    }

    const created = new this.categoryModel({
      name,
      isActive: dto.isActive ?? true,
    });

    return created.save();
  }

  // 🔹 Para usar desde productos: buscar o crear
  async findOrCreateByName(name: string): Promise<Category> {
    const normalized = normalizeCategoryName(name);

    if (!normalized) {
      throw new BadRequestException('Nombre de categoría inválido');
    }

    const exists = await this.categoryModel
      .findOne({ name: normalized })
      .exec();

    if (exists) return exists;

    const created = new this.categoryModel({ name: normalized, isActive: true });
    return created.save();
  }

}
