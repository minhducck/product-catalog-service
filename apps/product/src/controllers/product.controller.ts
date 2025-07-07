import { Body, Controller, Post } from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { ApiTags } from '@nestjs/swagger';
import { ProductModel } from '../model/product.model';

@Controller('products')
@ApiTags('Product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(@Body() productDto: ProductModel) {
    return this.productService.save(productDto);
  }
}
