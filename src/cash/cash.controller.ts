import { Controller, Get, Post, Body, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { CashService } from './cash.service';
import { OpenCashDto } from './dto/open-cash.dto';
import { CloseCashDto } from './dto/close-cash.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';


@UseGuards(JwtAuthGuard)
@Controller('cash')
export class CashController {
  constructor(private readonly cashService: CashService) {}

  /**
   * Devuelve la caja abierta actual del usuario logueado (si existe).
   */
  @Get('status')
  async getStatus(@Req() req: any) {
    const user = req.user;
    if (!user) throw new UnauthorizedException();

    // En nuestro estándar JWT:
    const tenantId = user.tenantId; // (antes businessId)
    const userId = user.userId;

    return this.cashService.getOpenCash(tenantId, userId);
  }

  /**
   * Abre una caja para el usuario logueado.
   * Regla de negocio: no puede existir otra caja abierta para ese usuario.
   */
  @Post('open')
  async openCash(@Req() req: any, @Body() dto: OpenCashDto) {
    const user = req.user;
    if (!user) throw new UnauthorizedException();

    const tenantId = user.tenantId;
    const userId = user.userId;

    return this.cashService.openCash(tenantId, userId, dto);
  }

  /**
   * Cierra la caja abierta del usuario logueado.
   * Calcula expectedAmount y difference en base a ventas del turno.
   */
  @Post('close')
  async closeCash(@Req() req: any, @Body() dto: CloseCashDto) {
    const user = req.user;
    if (!user) throw new UnauthorizedException();

    const tenantId = user.tenantId;
    const userId = user.userId;

    return this.cashService.closeCash(tenantId, userId, dto);
  }
}
