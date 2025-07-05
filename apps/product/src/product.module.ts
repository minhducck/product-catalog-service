import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { MysqlDatabaseModule } from '@database/mysql-database';
import { CommonModule } from '@common/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [CommonModule, MysqlDatabaseModule, TypeOrmModule.forFeature([])],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
