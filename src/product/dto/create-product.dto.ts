import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsOptional()
  @IsString()
  code?: string | null;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  stock: number;

  // viene del frontend como salePrice
  @IsNumber()
  @Min(0)
  salePrice: number;

  // viene del frontend como costPrice
  @IsNumber()
  @Min(0)
  costPrice: number;

  @IsOptional()
  @IsString()
  category?: string | null;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsBoolean()
  showOnline: boolean;
}
