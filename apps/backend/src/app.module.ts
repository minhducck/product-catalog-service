import { Module } from '@nestjs/common';
import { MysqlDatabaseModule } from '@database/mysql-database';
import { CommonModule } from '@common/common';
import { EntityModule } from '../../entity/src/entity.module';
import { AttributeModule } from '../../attribute/src/attribute.module';
import { CategoryModule } from '../../category/src/category.module';
import { ProductModule } from '../../product/src/product.module';

@Module({
  imports: [
    CommonModule,
    MysqlDatabaseModule,
    EntityModule,
    AttributeModule,
    CategoryModule,
    ProductModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
