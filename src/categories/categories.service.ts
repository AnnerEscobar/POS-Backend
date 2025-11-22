import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';

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
    const name = dto.name.trim();

    if (!name) {
      throw new BadRequestException('El nombre de la categoría es requerido');
    }

    const exists = await this.categoryModel
      .findOne({ name: new RegExp(`^${name}$`, 'i') })
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
    const trimmed = name.trim();
    if (!trimmed) {
      throw new BadRequestException('Nombre de categoría inválido');
    }

    const exists = await this.categoryModel
      .findOne({ name: new RegExp(`^${trimmed}$`, 'i') })
      .exec();

    if (exists) return exists;

    const created = new this.categoryModel({ name: trimmed, isActive: true });
    return created.save();
  }
}
