import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ default: null })
  code: string | null;

  @Prop({ required: true, min: 0 })
  stock: number;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, min: 0 })
  cost: number;

  @Prop({ default: null, index: true })
  category: string | null;

  @Prop({ default: null })
  description: string | null;

  @Prop({ default: true, index: true })
  showOnline: boolean;

  @Prop({ default: null })
  image: string | null;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// índices extra
ProductSchema.index({ category: 1 });
ProductSchema.index({ stock: 1 });
ProductSchema.index({ name: 'text' });
