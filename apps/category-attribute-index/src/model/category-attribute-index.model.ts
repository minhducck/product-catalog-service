import { BaseModel } from '@database/mysql-database/model/base.model';
import { Column, Entity, ManyToOne } from 'typeorm';
import { LinkTypeEnum } from '../types/link-type.enum';
import { CategoryModel } from '../../../category/src/model/category.model';
import { AttributeModel } from '../../../attribute/src/model/attribute.model';

@Entity({
  name: 'categories_attributes_index',
  comment: 'Category Attribute Entity',
})
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
    cascade: true,
    orphanedRowAction: 'delete',
  })
  attribute: AttributeModel;
}
