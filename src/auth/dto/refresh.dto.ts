import { IsString, MinLength } from 'class-validator';

export class RefreshDto {
  /**
   * Refresh token JWT.
   * Se valida y decodifica en el backend para obtener el userId (sub) y tenantId.
   */
  @IsString()
  @MinLength(20)
  refreshToken: string;
}
