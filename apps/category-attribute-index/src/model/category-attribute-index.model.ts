import { BaseModel } from '@database/mysql-database/model/base.model';
import { AfterLoad, Column, Entity, ManyToOne, Unique } from 'typeorm';
import { LinkTypeEnum } from '../types/link-type.enum';
import { CategoryModel } from '../../../category/src/model/category.model';
import { AttributeModel } from '../../../attribute/src/model/attribute.model';
import { Exclude } from 'class-transformer';

@Entity({
  name: 'categories_attributes_index',
  comment: 'Category Attribute Entity',
})
@Unique(['category', 'attribute'])
export class CategoryAttributeIndexModel extends BaseModel<CategoryAttributeIndexModel> {
  @Column({ type: 'enum', nullable: false, enum: LinkTypeEnum })
  linkType: LinkTypeEnum;

  @Column({ nullable: true, type: 'bigint' })
  categoryUuid: bigint | null;

  @ManyToOne(() => CategoryModel, {
    eager: true,
    createForeignKeyConstraints: false,
    nullable: true,
  })
  @Exclude({ toPlainOnly: true })
  category: CategoryModel | null;

  @ManyToOne(() => AttributeModel, {
    eager: false,
    createForeignKeyConstraints: true,
  })
  attribute: AttributeModel;

  @AfterLoad()
  protected populateCategoryUuid() {
    if (this.category) {
      this.categoryUuid = this.category.uuid;
    }
  }
}
