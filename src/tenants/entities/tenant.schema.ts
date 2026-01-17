import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TenantDocument = HydratedDocument<Tenant>;

@Schema({ timestamps: true })
export class Tenant {
  /** ID interno del tenant (puede ser el _id, pero lo dejamos explícito si quieres) */
  @Prop({ required: true, unique: true, index: true })
  tenantId: string;

  /**
   * Código legible del negocio (lo escribe el usuario).
   * Debe ser único globalmente.
   */
  @Prop({ required: true, unique: true, index: true, uppercase: true, trim: true })
  businessCode: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);
