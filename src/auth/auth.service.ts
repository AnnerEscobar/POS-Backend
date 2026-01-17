import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { UserDocument } from '../users/schemas/user.schema';
import { TenantsService } from 'src/tenants/tenants.service';

@Injectable()
export class AuthService {
  private atSecret = process.env.JWT_AT_SECRET || 'dev_at_secret';
  private rtSecret = process.env.JWT_RT_SECRET || 'dev_rt_secret';
  private atTtl = (process.env.JWT_AT_TTL || '15m') as any; // string tipo "15m"
  private rtTtl = (process.env.JWT_RT_TTL || '7d') as any;  // string tipo "7d"

  constructor(
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
    private readonly tenantsService: TenantsService,
  ) { }

  /** Valida credenciales contra Mongo */
private async validateUser(tenantId: string, email: string, password: string): Promise<UserDocument> {
  const user = await this.usersService.findByEmail(tenantId, email);
  if (!user) throw new UnauthorizedException('Credenciales inválidas');

  const ok = await argon2.verify(user.passwordHash, password);
  if (!ok) throw new UnauthorizedException('Credenciales inválidas');

  return user;
}



  /** Login normal: devuelve access + refresh y datos básicos de usuario */
async login(dto: LoginDto) {
  // 1) Resolver tenantId desde businessCode
  const tenantId = await this.tenantsService.resolveTenantIdByBusinessCode(dto.businessCode);

  // 2) Validar usuario dentro de ese tenant
  const user = await this.validateUser(tenantId, dto.email, dto.password);

  // 3) Emitir tokens con tenantId
  const tokens = await this.issueTokens(
    user._id.toString(),
    user.email,
    user.role,
    tenantId,
  );

  // 4) Guardar hash del refresh token
  const refreshHash = await argon2.hash(tokens.refreshToken);
  await this.usersService.updateRefreshToken(user._id.toString(), refreshHash);

  return {
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId,
    },
    ...tokens,
  };
}


  async refreshTokens(refreshToken: string) {
    // 1) Verifica firma y exp del refresh token con rtSecret
    const payload = await this.jwt.verifyAsync(refreshToken, {
      secret: this.rtSecret,
    });

    const userId = payload.sub as string;

    // 2) Busca usuario y compara refreshHash guardado
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshHash) throw new UnauthorizedException();

    const valid = await argon2.verify(user.refreshHash, refreshToken);
    if (!valid) throw new UnauthorizedException();

    // 3) Emite nuevos tokens (rotación)
    const tokens = await this.issueTokens(
      user._id.toString(),
      user.email,
      user.role,
      user.tenantId, // <- importante
    );

    const newHash = await argon2.hash(tokens.refreshToken);
    await this.usersService.updateRefreshToken(userId, newHash);

    return tokens;
  }


  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { ok: true };
  }

  async me(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  private async issueTokens(sub: string, email: string, role: string, tenantId: string) {
    /**
     * Payload mínimo para autorización y resolución del tenant.
     * - sub: id del usuario
     * - tenantId: id del negocio (clave para conectar a la BD correcta)
     */
    const payload = { sub, email, role, tenantId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, { secret: this.atSecret, expiresIn: this.atTtl }),
      this.jwt.signAsync(payload, { secret: this.rtSecret, expiresIn: this.rtTtl }),
    ]);

    return { accessToken, refreshToken };
  }
}
