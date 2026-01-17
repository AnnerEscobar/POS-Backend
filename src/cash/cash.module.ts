import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CashRegister, CashRegisterSchema } from './schemas/cash.schema';
import { CashService } from './cash.service';
import { CashController } from './cash.controller';
import { Sale, SaleSchema } from 'src/sales/schemas/sale.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CashRegister.name, schema: CashRegisterSchema },
      { name: Sale.name, schema: SaleSchema },
    ])
  ],
  controllers: [CashController],
  providers: [CashService],
  exports: [CashService],
})
export class CashModule { }
