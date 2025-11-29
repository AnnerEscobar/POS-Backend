import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { FindSalesQueryDto } from './dto/find-sales-query.dto';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  create(@Body() dto: CreateSaleDto) {
    return this.salesService.create(dto);
  }

  @Get()
  findAll(@Query() query: FindSalesQueryDto) {
    return this.salesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }
}
