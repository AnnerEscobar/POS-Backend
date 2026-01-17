import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  /**
   * Tenant/negocio dueño de la categoría.
   * Multi-tenant: evita mezclar catálogos entre negocios.
   */
  @Prop({ required: true, index: true })
  tenantId: string;

  /**
   * Nombre normalizado de la categoría.
   * Nota: la unicidad debe ser por tenant.
   */
  @Prop({ required: true, trim: true })
  name: string;

  /** Flag para ocultar categorías sin borrarlas. */
  @Prop({ default: true })
  isActive: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

/**
 * Índice único por tenant: el mismo nombre puede existir en distintos negocios.
 */
CategorySchema.index({ tenantId: 1, name: 1 }, { unique: true });
