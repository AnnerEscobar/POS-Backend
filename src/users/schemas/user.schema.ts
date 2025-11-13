import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop()
  name?: string;

  @Prop({ default: 'user' })
  role: string;

  @Prop()
  refreshHash?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
