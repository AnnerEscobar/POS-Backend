import { IsDateString, IsOptional } from 'class-validator';

export class FindSalesQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string; // fecha mínima

  @IsOptional()
  @IsDateString()
  to?: string;   // fecha máxima
}
