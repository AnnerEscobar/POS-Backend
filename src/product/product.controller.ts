import { Controller, Get, Post, Body, Query, Patch, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FindProductsQueryDto } from './dto/find-product-query.dto';
import { QuickUpdateProductDto } from './dto/QuickUpdateProduct.dto';
import { UpdateProductDto } from './dto/UpdateProduct.dto';

@UseGuards(JwtAuthGuard)
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /** Crea producto dentro del tenant actual. */
  @Post()
  create(@Req() req: any, @Body() dto: CreateProductDto) {
    return this.productService.create(req.user.tenantId, dto);
  }

  /** Lista productos del tenant actual con filtros/paginación. */
  @Get()
  findAll(@Req() req: any, @Query() query: FindProductsQueryDto) {
    return this.productService.findAll(req.user.tenantId, query);
  }

  /** Update rápido (stock/precio/costo) para el tenant actual. */
  @Patch('quick/:id')
  quickUpdate(@Req() req: any, @Param('id') id: string, @Body() dto: QuickUpdateProductDto) {
    return this.productService.quickUpdate(req.user.tenantId, id, dto);
  }

  /** Update general para el tenant actual. */
  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.update(req.user.tenantId, id, dto);
  }
}
