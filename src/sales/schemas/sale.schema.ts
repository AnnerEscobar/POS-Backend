import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SaleDocument = Sale & Document;

@Schema({ timestamps: true })
export class Sale {
    @Prop({ type: Date, default: Date.now })
    date: Date;

    @Prop({
        type: [
            {
                productId: { type: String, default: null, required: false }, // 👈
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

    // Preparado para FEL
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

// índices útiles
SaleSchema.index({ date: -1 });
SaleSchema.index({ 'customer.nit': 1 });
