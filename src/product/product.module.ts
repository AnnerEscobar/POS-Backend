import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.schema';
import { CategoriesModule } from 'src/categories/categories.module';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
    imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
    ]),
    CategoriesModule,
  ],
  exports: [ProductService],
})
export class ProductModule {}
