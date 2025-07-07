import { Module } from '@nestjs/common';
import { ProductController } from './controllers/product.controller';
import { ProductService } from './services/product.service';
import { MysqlDatabaseModule } from '@database/mysql-database';
import { CommonModule } from '@common/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModel } from './model/product.model';

@Module({
  imports: [
    CommonModule,
    MysqlDatabaseModule,
    TypeOrmModule.forFeature([ProductModel]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
