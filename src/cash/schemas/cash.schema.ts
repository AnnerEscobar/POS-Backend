import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Types } from 'mongoose';

export type CashRegisterDocument = HydratedDocument<CashRegister>;

@Schema({ timestamps: true })
export class CashRegister {
  /**
   * Identificador del negocio/tenant dueño de esta caja.
   * Multi-tenant: sirve para filtrar y aislar datos por negocio.
   */
    @Prop({ type: Types.ObjectId, ref: 'Business', required: true, index: true })
  tenantId: string;

  /**
   * Usuario que abrió la caja (responsable del turno).
   */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: string;

  /**
   * Fondo inicial con el que se abrió la caja.
   */
  @Prop({ required: true })
  initialAmount: number;

  /**
   * Monto contado al cerrar (dinero real en caja).
   */
  @Prop()
  closingAmount?: number;

  /**
   * Monto esperado según sistema:
   * initialAmount + ventas - egresos (cuando existan).
   */
  @Prop()
  expectedAmount?: number;

  /**
   * Diferencia entre lo contado y lo esperado.
   * difference = closingAmount - expectedAmount
   */
  @Prop()
  difference?: number;

  /**
   * Estado actual de la caja:
   * - open: la caja está activa y permite operaciones
   * - closed: la caja ya fue cerrada
   */
  @Prop({ required: true, enum: ['open', 'closed'], default: 'open' })
  status: 'open' | 'closed';

  /**
   * Fecha/hora de apertura.
   * Se usa como referencia para calcular ventas del turno.
   */
  @Prop({ required: true, default: () => new Date() })
  openingTime: Date;

  /**
   * Fecha/hora de cierre.
   */
  @Prop()
  closingTime?: Date;

  /**
   * Notas del turno.
   */
  @Prop()
  notes?: string;
}

export const CashRegisterSchema = SchemaFactory.createForClass(CashRegister);

// Recomendado: índice para búsquedas rápidas de caja abierta
CashRegisterSchema.index({ businessId: 1, userId: 1, status: 1 });