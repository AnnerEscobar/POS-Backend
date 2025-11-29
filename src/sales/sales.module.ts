import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Sale, SaleSchema } from './schemas/sale.schema';
import { Product } from 'src/product/schemas/product.schema';
import { ProductModule } from 'src/product/product.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Sale.name, schema: SaleSchema }]),
    ProductModule,
  ],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule { }
