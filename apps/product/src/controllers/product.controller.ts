import { Body, Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { ApiTags } from '@nestjs/swagger';
import { ProductModel } from '../model/product.model';
import { ProductCreationDto } from '../types/product-creation.dto';
import { SearchQueryResponseInterceptor } from '@database/mysql-database/interceptor/search-query-response-interceptor.service';

@Controller('products')
@ApiTags('Product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(@Body() productDto: ProductCreationDto) {
    return this.productService.save(
      ProductModel.create<ProductModel>(productDto),
    );
  }

  @Get()
  @UseInterceptors(SearchQueryResponseInterceptor)
  getProductList() {
    return this.productService.getListAndCount();
  }
}
