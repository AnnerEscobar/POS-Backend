import { IsNotEmpty, IsNumber } from 'class-validator';

export class CloseCashDto {
  /**
   * Monto contado físicamente al cerrar caja.
   * Se usa para calcular diferencia vs el monto esperado (ventas + fondo inicial - egresos).
   */
  @IsNotEmpty()
  @IsNumber()
  closingAmount: number;
}
