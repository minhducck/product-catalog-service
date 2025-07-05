import { BaseModel } from '@database/mysql-database/model/base.model';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CategoryModel } from '../../../category/src/model/category.model';

@Entity({
  name: 'products',
  comment: 'Product entity table',
})
export class ProductModel extends BaseModel<ProductModel> {
  @ManyToOne(() => CategoryModel, (object) => object.linkedProducts, {
    createForeignKeyConstraints: true,
    cascade: true,
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
  category: CategoryModel;
}
