import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class OpenCashDto {
  /**
   * Fondo inicial de caja (dinero con el que se empieza el turno).
   */
  @IsNotEmpty()
  @IsNumber()
  initialAmount: number;

  /**
   * Notas opcionales (ej: "Cambio en billetes pequeños").
   */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  notes?: string;
}
