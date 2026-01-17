import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant, TenantDocument } from './entities/tenant.schema';

@Injectable()
export class TenantsService {
  constructor(@InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>) {}

  /**
   * Resuelve un businessCode al tenantId real.
   * Lanza Unauthorized si el negocio no existe o está inactivo.
   */
  async resolveTenantIdByBusinessCode(businessCode: string): Promise<string> {
    const code = businessCode.trim().toUpperCase();

    const tenant = await this.tenantModel.findOne({ businessCode: code, isActive: true }).exec();
    if (!tenant) throw new UnauthorizedException('Negocio inválido');

    return tenant.tenantId;
  }
}
