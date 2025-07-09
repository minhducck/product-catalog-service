import { BaseModel } from '@database/mysql-database/model/base.model';
import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { LinkTypeEnum } from '../types/link-type.enum';
import { CategoryModel } from '../../../category/src/model/category.model';
import { AttributeModel } from '../../../attribute/src/model/attribute.model';

@Entity({
  name: 'categories_attributes_index',
  comment: 'Category Attribute Entity',
})
@Unique(['category', 'attribute'])
export class CategoryAttributeIndexModel extends BaseModel<CategoryAttributeIndexModel> {
  @Column({ type: 'enum', nullable: false, enum: LinkTypeEnum })
  linkType: LinkTypeEnum;

  @ManyToOne(() => CategoryModel, {
    createForeignKeyConstraints: true,
    nullable: true,
  })
  category: CategoryModel | null;

  @ManyToOne(() => AttributeModel, {
    createForeignKeyConstraints: true,
  })
  attribute: AttributeModel;
}
