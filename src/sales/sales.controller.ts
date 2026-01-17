import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { FindSalesQueryDto } from './dto/find-sales-query.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  /**
   * Crea una venta.
   * Reglas importantes:
   * - Requiere usuario autenticado (JwtAuthGuard).
   * - La venta se registra dentro del tenant del usuario logueado.
   * - El service valida que exista caja abierta antes de permitir la venta.
   */
  @Post()
  create(@Req() req: any, @Body() dto: CreateSaleDto) {
    return this.salesService.create(req.user.tenantId, req.user.userId, dto);
  }

  /**
   * Lista ventas del tenant actual.
   * Soporta filtro opcional por rango de fechas (from/to).
   * Nota: el filtrado por tenant evita que un negocio vea ventas de otro.
   */
  @Get()
  findAll(@Req() req: any, @Query() query: FindSalesQueryDto) {
    return this.salesService.findAll(req.user.tenantId, query);
  }

  /**
   * Obtiene una venta por ID dentro del tenant actual.
   * Nota: se filtra por tenantId para evitar acceso cruzado.
   */
  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.salesService.findOne(req.user.tenantId, id);
  }
}
