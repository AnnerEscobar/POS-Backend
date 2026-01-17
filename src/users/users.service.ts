import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  /**
   * Busca usuario por tenant y email.
   * Esto es clave para SaaS multi-tenant.
   */
async findByEmail(tenantId: string, email: string) {
  return this.userModel.findOne({
    tenantId,
    email: email.toLowerCase().trim(),
  }).exec();
}


  async findById(id: string) {
    return this.userModel.findById(id).exec();
  }

  async updateRefreshToken(userId: string, refreshHash: string | null) {
    return this.userModel.updateOne({ _id: userId }, { refreshHash }).exec();
  }

  /**
   * Crea usuario.
   * Ojo: normalmente esto lo hace un owner/admin, no un endpoint público.
   */
  async create(data: Partial<User>) {
    const created = new this.userModel(data);
    return created.save();
  }
}
