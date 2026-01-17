import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CashRegister } from './schemas/cash.schema';
import { OpenCashDto } from './dto/open-cash.dto';
import { Sale } from 'src/sales/schemas/sale.schema';
import { CloseCashDto } from './dto/close-cash.dto';




@Injectable()
export class CashService {
  constructor(
    @InjectModel(CashRegister.name) private cashModel: Model<CashRegister>,
    @InjectModel(Sale.name) private saleModel: Model<Sale>,
  ) { }

  /**
   * Busca la caja abierta actual para un usuario dentro de un negocio.
   * Esto se usa para:
   * - impedir doble apertura
   * - validar que exista caja antes de vender
   * - obtener tiempos del turno
   */
  async getOpenCash(tenantId: string, userId: string) {
    return this.cashModel.findOne({ tenantId, userId, status: 'open' });
  }


  /**
   * Abre caja si no existe una caja abierta para el usuario.
   */
  async openCash(tenantId: string, userId: string, dto: OpenCashDto) {
    const existing = await this.getOpenCash(tenantId, userId);
    if (existing) throw new BadRequestException('Ya existe una caja abierta para este usuario.');

    return new this.cashModel({
      tenantId,
      userId,
      initialAmount: dto.initialAmount,
      notes: dto.notes || '',
      status: 'open',
      openingTime: new Date(),
    }).save();
  }

  /**
   * Cierra la caja abierta y calcula:
   * - ventas del turno (desde openingTime hasta ahora)
   * - expectedAmount
   * - diferencia vs monto contado
   */
async closeCash(tenantId: string, userId: string, dto: CloseCashDto) {
  // 1) Buscar la caja abierta del usuario dentro del tenant
  const cash = await this.getOpenCash(tenantId, userId);
  if (!cash) throw new BadRequestException('No hay una caja abierta para este usuario.');

  const openingTime = cash.openingTime;
  const now = new Date();

  /**
   * 2) Calcula ventas del turno.
   * Importante:
   * - Esto depende de que Sale tenga tenantId y userId guardados.
   * - Usa createdAt (por timestamps) para medir el rango real.
   * Futuro recomendado:
   * - Filtrar por cashRegisterId en vez de fechas.
   */
  const salesAgg = await this.saleModel.aggregate([
    {
      $match: {
        tenantId,
        userId,
        createdAt: { $gte: openingTime, $lte: now },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$total' },
      },
    },
  ]);

  const totalSales = salesAgg.length ? salesAgg[0].total : 0;

  // TODO: cuando existan egresos/entradas manuales, se calculan aquí
  const totalExpenses = 0;

  // 3) Monto esperado: fondo inicial + ventas - egresos
  const expectedAmount = cash.initialAmount + totalSales - totalExpenses;

  // 4) Guardar cierre
  cash.closingAmount = dto.closingAmount;
  cash.expectedAmount = expectedAmount;
  cash.difference = dto.closingAmount - expectedAmount;
  cash.status = 'closed';
  cash.closingTime = now;

  return cash.save();
}

}
