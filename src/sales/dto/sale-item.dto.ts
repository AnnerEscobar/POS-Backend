import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class SaleItemDto {
  @IsNotEmpty()
  @IsString()
  productId?: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  subtotal: number;

  @IsOptional()
  @IsString()
  code?: string | null;
}
