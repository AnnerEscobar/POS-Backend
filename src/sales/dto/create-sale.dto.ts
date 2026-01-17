import {
  IsArray,
  IsDateString,
  IsIn,
  IsNotEmptyObject,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SaleItemDto } from './sale-item.dto';

// 🔹 DTO para el cliente (opcional)
export class CustomerDto {
  @IsOptional()
  @IsString()
  name?: string | null;

  @IsOptional()
  @IsString()
  nit?: string | null; // 'CF' si no dan NIT
}

// 🔹 DTO para el pago
export class PaymentDto {
  /**
   * Método de pago.
   * Nota: en "mixto" normalmente se requiere un desglose adicional (futuro).
   */
  @IsIn(['efectivo', 'tarjeta', 'transferencia', 'mixto'])
  method: 'efectivo' | 'tarjeta' | 'transferencia' | 'mixto';

  /** Monto pagado por el cliente. */
  @IsNumber()
  @Min(0)
  paid: number;

  /** Cambio entregado (normalmente solo aplica si method = efectivo). */
  @IsNumber()
  @Min(0)
  change: number;
}

// 🔹 DTO principal para crear venta
export class CreateSaleDto {
  @IsOptional()
  @IsDateString()
  date?: string; // opcional, por defecto ahora

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @IsNumber()
  @Min(0)
  total: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => CustomerDto)
  customer?: CustomerDto;

  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => PaymentDto)
  payment: PaymentDto;
}
