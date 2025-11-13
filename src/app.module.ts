import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URL ?? 'mongodb://localhost:27017/pos'),
    AuthModule, 
    UsersModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
