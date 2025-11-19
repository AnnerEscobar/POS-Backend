import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) { }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string) {
    return this.userModel.findById(id).exec();
  }

  async updateRefreshToken(userId: string, refreshHash: string | null) {
    return this.userModel.updateOne(
      { _id: userId },
      { refreshHash },
    ).exec();
  }

  async create(data: Partial<User>) {
    const created = new this.userModel(data);
    return created.save();
  }

}
