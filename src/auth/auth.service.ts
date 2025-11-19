import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  private atSecret = process.env.JWT_AT_SECRET || 'dev_at_secret';
  private rtSecret = process.env.JWT_RT_SECRET || 'dev_rt_secret';
  private atTtl = (process.env.JWT_AT_TTL || '15m') as any; // string tipo "15m"
  private rtTtl = (process.env.JWT_RT_TTL || '7d') as any;  // string tipo "7d"

  constructor(
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
  ) {}

  /** Valida credenciales contra Mongo */
  private async validateUser(email: string, password: string): Promise<UserDocument> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    return user;
  }

  /** Login normal: devuelve access + refresh y datos básicos de usuario */
  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);

    const tokens = await this.issueTokens(
      user._id.toString(),
      user.email,
      user.role,
    );

    // guardamos hash del refresh token
    const refreshHash = await argon2.hash(tokens.refreshToken);
    await this.usersService.updateRefreshToken(user._id.toString(), refreshHash);

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }

  /** Devuelve nuevos tokens a partir de un refresh válido */
  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshHash) throw new UnauthorizedException();

    const valid = await argon2.verify(user.refreshHash, refreshToken);
    if (!valid) throw new UnauthorizedException();

    const tokens = await this.issueTokens(user._id.toString(), user.email, user.role);
    const refreshHash = await argon2.hash(tokens.refreshToken);
    await this.usersService.updateRefreshToken(user._id.toString(), refreshHash);

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

  /** Crea access + refresh tokens */
  private async issueTokens(sub: string, email: string, role: string) {
    const payload = { sub, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.atSecret,
        expiresIn: this.atTtl as any,   // casteo simple para evitar peleas de tipos
      }),
      this.jwt.signAsync(payload, {
        secret: this.rtSecret,
        expiresIn: this.rtTtl as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
