import { BaseModel } from '@database/mysql-database/model/base.model';
import { Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { CategoryModel } from '../../../category/src/model/category.model';
import { ProductAttributeValueModel } from './product-attribute-value.model';
import { ApiProperty } from '@nestjs/swagger/dist/decorators';

@Entity({
  name: 'products',
  comment: 'Product entity table',
})
export class ProductModel extends BaseModel<ProductModel> {
  @ManyToOne(() => CategoryModel, (object) => object.linkedProducts, {
    createForeignKeyConstraints: true,
    cascade: false,
    lazy: true,
    persistence: false,
    nullable: true,
    onDelete: 'NO ACTION',
  })
  @JoinColumn({
    name: 'categoryId',
    referencedColumnName: 'uuid',
    foreignKeyConstraintName: 'PRODUCT_CATEGORY_ID_CATEGORY_UUID',
  })
  // @ApiProperty({ type: CategoryModel })
  category: CategoryModel;

  @OneToMany(
    () => ProductAttributeValueModel,
    (attributeValue) => attributeValue.product,
    { eager: true, persistence: true },
  )
  @ApiProperty({ type: [ProductAttributeValueModel] })
  attributeValues: ProductAttributeValueModel[];
}
