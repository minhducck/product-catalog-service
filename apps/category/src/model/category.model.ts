import { BaseModel } from '@database/mysql-database/model/base.model';
import { Entity, JoinTable, ManyToMany } from 'typeorm';
import { AttributeModel } from '../../../attribute/src/model/attribute.model';

@Entity({
  name: 'categories',
  comment: 'Category Entity',
})
export class CategoryModel extends BaseModel<CategoryModel> {
  @ManyToMany(() => AttributeModel, {
    cascade: false,
    onDelete: 'NO ACTION',
    lazy: true,
    nullable: true,
    createForeignKeyConstraints: true,
    persistence: false,
  })
  @JoinTable({ name: 'category_assigned_attribute' })
  assignedAttributes: AttributeModel[];
}
