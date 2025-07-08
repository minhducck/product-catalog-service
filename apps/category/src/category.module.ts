import { Module } from '@nestjs/common';
import { CategoryController } from './controllers/category.controller';
import { CategoryService } from './services/category.service';
import { AttributeModule } from '../../attribute/src/attribute.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModel } from './model/category.model';
import { MysqlDatabaseModule } from '@database/mysql-database';
import { CommonModule } from '@common/common';
import { CategoryAttributeIndexModule } from '../../category-attribute-index/src/category-attribute-index.module';
import { IndexAttributeOptionLinkageListener } from './listeners/index-attribute-option-linkage.listener';
import { CategoryAttributesController } from './controllers/category-attributes.controller';

@Module({
  imports: [
    CommonModule,
    MysqlDatabaseModule,
    AttributeModule,
    CategoryAttributeIndexModule,
    TypeOrmModule.forFeature([CategoryModel]),
  ],
  controllers: [CategoryController, CategoryAttributesController],
  providers: [CategoryService, IndexAttributeOptionLinkageListener],
})
export class CategoryModule {}
