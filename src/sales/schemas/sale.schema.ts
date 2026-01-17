import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SaleDocument = Sale & Document;

@Schema({ timestamps: true })
export class Sale {
  /**
   * Tenant/negocio dueño de la venta.
   * Multi-tenant: permite aislar ventas por negocio.
   */
  @Prop({ required: true, index: true })
  tenantId: string;

  /**
   * Usuario/cajero que registró la venta.
   */
  @Prop({ required: true, index: true })
  userId: string;

  /**
   * Caja/turno contra la que se registró la venta.
   * Clave para que el cierre de caja sea exacto.
   */
  @Prop({ required: true, index: true })
  cashRegisterId: string;

  /**
   * Fecha de la venta (para reportes/filtrado).
   * Nota: también existe createdAt por timestamps.
   */
  @Prop({ type: Date, default: Date.now })
  date: Date;

  @Prop({
    type: [
      {
        productId: { type: String, default: null, required: false },
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
        subtotal: { type: Number, required: true, min: 0 },
        code: { type: String, default: null },
      },
    ],
    required: true,
  })
  items: {
    productId?: string | null;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
    code?: string | null;
  }[];

  @Prop({ required: true, min: 0 })
  total: number;

  @Prop({
    type: {
      name: { type: String, default: null },
      nit: { type: String, default: 'CF' },
    },
    default: null,
  })
  customer: {
    name?: string | null;
    nit?: string | null;
  } | null;

  @Prop({
    type: {
      method: { type: String, enum: ['efectivo', 'tarjeta', 'transferencia', 'mixto'], required: true },
      paid: { type: Number, required: true, min: 0 },
      change: { type: Number, required: true, min: 0 },
    },
    required: true,
  })
  payment: {
    method: 'efectivo' | 'tarjeta' | 'transferencia' | 'mixto';
    paid: number;
    change: number;
  };

  /**
   * Preparado para FEL (certificación, UUID, etc.).
   */
  @Prop({
    type: {
      certified: { type: Boolean, default: false },
      uuid: { type: String, default: null },
      serie: { type: String, default: null },
      numero: { type: String, default: null },
      pdfUrl: { type: String, default: null },
    },
    default: { certified: false },
  })
  fel?: {
    certified: boolean;
    uuid?: string | null;
    serie?: string | null;
    numero?: string | null;
    pdfUrl?: string | null;
  };
}

export const SaleSchema = SchemaFactory.createForClass(Sale);

/**
 * Índices:
 * - date: listar ventas recientes rápido
 * - customer.nit: búsquedas por NIT
 * - tenantId + date: reportes por negocio
 * - tenantId + cashRegisterId: cierres de caja exactos
 */
SaleSchema.index({ date: -1 });
SaleSchema.index({ 'customer.nit': 1 });
SaleSchema.index({ tenantId: 1, date: -1 });
SaleSchema.index({ tenantId: 1, cashRegisterId: 1 });
SaleSchema.index({ tenantId: 1, userId: 1, date: -1 });
