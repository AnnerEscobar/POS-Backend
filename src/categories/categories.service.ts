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


  async findAll(tenantId: string): Promise<Category[]> {
    return this.categoryModel
      .find({ tenantId, isActive: true })
      .sort({ name: 1 })
      .lean()
      .exec();
  }

  async create(tenantId: string, dto: CreateCategoryDto): Promise<Category> {
    const name = normalizeCategoryName(dto.name);
    if (!name) throw new BadRequestException('El nombre de la categoría es requerido');

    const exists = await this.categoryModel.findOne({ tenantId, name }).exec();
    if (exists) throw new BadRequestException('La categoría ya existe');

    const created = new this.categoryModel({
      tenantId,
      name,
      isActive: dto.isActive ?? true,
    });

    return created.save();
  }

  async findOrCreateByName(tenantId: string, name: string): Promise<Category> {
  const normalized = normalizeCategoryName(name);
  if (!normalized) throw new BadRequestException('Nombre de categoría inválido');

  const exists = await this.categoryModel.findOne({ tenantId, name: normalized }).exec();
  if (exists) return exists;

  return new this.categoryModel({ tenantId, name: normalized, isActive: true }).save();
}

}
