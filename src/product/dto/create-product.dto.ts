import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  /** Código de barras o código interno (opcional). */
  @IsOptional()
  @IsString()
  code?: string | null;

  /** Nombre del producto. */
  @IsNotEmpty()
  @IsString()
  name: string;

  /** Stock inicial. */
  @IsNumber()
  @Min(0)
  stock: number;

  /** Precio de venta (frontend: salePrice). */
  @IsNumber()
  @Min(0)
  salePrice: number;

  /** Costo (frontend: costPrice). */
  @IsNumber()
  @Min(0)
  costPrice: number;

  /** Categoría por nombre (opcional). */
  @IsOptional()
  @IsString()
  category?: string | null;

  /** Descripción opcional. */
  @IsOptional()
  @IsString()
  description?: string | null;

  /** Mostrar en catálogo online (opcional). */
  @IsOptional()
  @IsBoolean()
  showOnline?: boolean;
}

