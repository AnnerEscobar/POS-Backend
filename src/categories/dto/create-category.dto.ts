import { IsBoolean, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  /** Nombre visible de la categoría (ej: "Bebidas"). */
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  /** Permite crearla desactivada (opcional). */
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
