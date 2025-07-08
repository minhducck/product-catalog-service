import { Module } from '@nestjs/common';
import { CategoryAttributeIndexService } from './services/category-attribute-index.service';
import { CommonModule } from '@common/common';
import { MysqlDatabaseModule } from '@database/mysql-database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryAttributeIndexModel } from './model/category-attribute-index.model';

@Module({
  imports: [
    CommonModule,
    MysqlDatabaseModule,
    TypeOrmModule.forFeature([CategoryAttributeIndexModel]),
  ],
  providers: [CategoryAttributeIndexService],
  exports: [CategoryAttributeIndexService],
})
export class CategoryAttributeIndexModule {}
