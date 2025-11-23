import { Controller, Get, Post, Body, Query, Patch, Param } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FindProductsQueryDto } from './dto/find-product-query.dto';
import { QuickUpdateProductDto } from './dto/QuickUpdateProduct.dto';
import { UpdateProductDto } from './dto/UpdateProduct.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @Get()
  findAll(@Query() query: FindProductsQueryDto) {
    return this.productService.findAll(query);
  }

   // ⬇️ rápido (precio/costo/stock)
  @Patch('quick/:id')
  quickUpdate(@Param('id') id: string, @Body() dto: QuickUpdateProductDto) {
    return this.productService.quickUpdate(id, dto);
  }

  // ⬇️ general (nombre, categoría, descripción, etc.)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.update(id, dto);
  }

  // aquí seguirían tus otros endpoints (GET /:id, PATCH, DELETE, etc.)
}
