import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductModule } from './product/product.module';
import { CategoriesModule } from './categories/categories.module';
import { ConfigModule } from '@nestjs/config';
import { SalesModule } from './sales/sales.module';
import { CashModule } from './cash/cash.module';
import { TenantsModule } from './tenants/tenants.module';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    MongooseModule.forRoot(process.env.MONGO_URL),
    AuthModule, 
    UsersModule, ProductModule, CategoriesModule, SalesModule, CashModule, TenantsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
