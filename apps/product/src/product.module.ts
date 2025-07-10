import { Module } from '@nestjs/common';
import { ProductController } from './controllers/product.controller';
import { ProductService } from './services/product.service';
import { MysqlDatabaseModule } from '@database/mysql-database';
import { CommonModule } from '@common/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModel } from './model/product.model';
import { ProductAttributeValueModel } from './model/product-attribute-value.model';

@Module({
  imports: [
    CommonModule,
    MysqlDatabaseModule,
    TypeOrmModule.forFeature([ProductModel, ProductAttributeValueModel]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
