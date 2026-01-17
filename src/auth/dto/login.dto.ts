import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {

  /**
   * Código público del negocio (el usuario lo escribe).
   * Se usa para resolver el tenantId real del negocio.
   */
  @IsString()
  @MinLength(3)
  businessCode: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

}
