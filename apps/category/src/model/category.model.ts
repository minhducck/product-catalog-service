import { BaseModel } from '@database/mysql-database/model/base.model';
import {
  AfterLoad,
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  Unique,
  VirtualColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger/dist/decorators';
import { AttributeModel } from '../../../attribute/src/model/attribute.model';
import { ProductModel } from '../../../product/src/model/product.model';
import { CategoryAttributeIndexModel } from '../../../category-attribute-index/src/model/category-attribute-index.model';
import { Exclude, Transform } from 'class-transformer';

@Entity({
  name: 'categories',
  comment: 'Category Entity',
})
@Unique(['name', 'parentCategory'])
export class CategoryModel extends BaseModel<CategoryModel> {
  @Column({
    type: 'varchar',
    nullable: false,
    length: 255,
    comment: 'Category Name',
  })
  @ApiProperty({ description: 'Name', type: 'string' })
  @Index({ fulltext: true })
  name: string;

  @ManyToOne(() => CategoryModel, {
    createForeignKeyConstraints: false,
    nullable: true,
    persistence: false,
    orphanedRowAction: 'nullify',
  })
  @JoinColumn({
    name: 'parentId',
    referencedColumnName: 'uuid',
    foreignKeyConstraintName: 'CATEGORY_PARENT_ID_CATEGORY_UUID',
  })
  @ApiProperty({ description: 'Parent ID', type: 'string', nullable: true })
  @Transform(({ value }) => (value ? (value as CategoryModel).uuid : null), {
    toPlainOnly: true,
  })
  parentCategory: CategoryModel | bigint | undefined;

  @OneToMany(() => CategoryModel, (child) => child.parentCategory, {
    cascade: true,
    onDelete: 'SET NULL',
  })
  @ApiProperty({
    type: CategoryModel,
    isArray: true,
    nullable: true,
    default: true,
  })
  children: CategoryModel[];

  @Column({ type: 'int', nullable: true })
  @Exclude({ toPlainOnly: true })
  left: number;

  @Column({ type: 'int', nullable: true })
  @Exclude({ toPlainOnly: true })
  right: number;

  @Column({ type: 'int', nullable: true })
  @Exclude({ toPlainOnly: true })
  level: number;

  @ManyToMany(() => AttributeModel, {
    cascade: false,
    nullable: true,
    eager: true,
    persistence: true,
  })
  @JoinTable({ name: 'category_assigned_attribute' })
  assignedAttributes: undefined | AttributeModel[];

  @OneToMany(() => ProductModel, (product) => product.category, {
    lazy: true,
    createForeignKeyConstraints: false,
  })
  linkedProducts: ProductModel[] | Promise<ProductModel[]>;

  @VirtualColumn({
    type: 'int',
    query: (alias) =>
      `SELECT COUNT(uuid) FROM products WHERE products.categoryId = ${alias}.uuid`,
  })
  productCount: number;

  @VirtualColumn({
    type: 'int',
    query: (alias) =>
      `SELECT COUNT(attributesUuid) FROM category_assigned_attribute WHERE category_assigned_attribute.categoriesUuid = ${alias}.uuid`,
  })
  readonly assignedAttributeCount: number;

  @OneToMany(
    () => CategoryAttributeIndexModel,
    (catAttrIndex) => catAttrIndex.category,
    {
      lazy: true,
      persistence: false,
    },
  )
  readonly attributeLinks: CategoryAttributeIndexModel[];

  @AfterLoad()
  protected initializeDefaultValues() {
    if (!this.assignedAttributes) {
      this.assignedAttributes = [];
    }
  }

  /** Ignore lazy load **/

  @Exclude({ toPlainOnly: true })
  __linkedProducts__?: ProductModel[];
  @Exclude({ toPlainOnly: true })
  __has_linkedProducts__?: boolean;
  @Exclude({ toPlainOnly: true })
  __attributeLinks__?: CategoryAttributeIndexModel[];
  @Exclude({ toPlainOnly: true })
  __has_attributeLinks__?: boolean;
}
