import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { AttributeModule } from '../../attribute/src/attribute.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModel } from './model/category.model';
import { MysqlDatabaseModule } from '@database/mysql-database';
import { CommonModule } from '@common/common';

@Module({
  imports: [
    CommonModule,
    MysqlDatabaseModule,
    AttributeModule,
    TypeOrmModule.forFeature([CategoryModel]),
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
