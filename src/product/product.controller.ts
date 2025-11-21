import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FindProductsQueryDto } from './dto/find-product-query.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

   @Get()
  findAll(@Query() query: FindProductsQueryDto) {
    return this.productService.findAll(query);
  }

  // aquí seguirían tus otros endpoints (GET /:id, PATCH, DELETE, etc.)
}
