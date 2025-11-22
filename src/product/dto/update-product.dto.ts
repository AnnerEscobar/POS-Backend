import { IsNumber, IsOptional, Min } from 'class-validator';

export class QuickUpdateProductDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number; // salePrice en el front → price en el schema

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;  // costPrice en el front → cost en el schema
}
