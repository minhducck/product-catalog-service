import { BaseModel } from '@database/mysql-database/model/base.model';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  VirtualColumn,
} from 'typeorm';
import { AttributeModel } from '../../../attribute/src/model/attribute.model';
import { ProductModel } from '../../../product/src/model/product.model';
import {
  ApiProperty,
  ApiResponseProperty,
} from '@nestjs/swagger/dist/decorators';

@Entity({
  name: 'categories',
  comment: 'Category Entity',
})
export class CategoryModel extends BaseModel<CategoryModel> {
  @Column({
    type: 'varchar',
    nullable: false,
    length: 255,
    comment: 'Category Name',
  })
  @ApiProperty({ description: 'Name', type: 'string' })
  name: string;

  @ManyToOne(() => CategoryModel, {
    createForeignKeyConstraints: true,
    nullable: true,
    persistence: true,
    cascade: false,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parentId', referencedColumnName: 'uuid' })
  @ApiProperty({ description: 'Parent ID', type: 'string', nullable: true })
  parentCategory: CategoryModel | bigint | undefined;

  @OneToMany(() => CategoryModel, (child) => child.parentCategory)
  @ApiResponseProperty({ type: [CategoryModel] })
  children: CategoryModel[];

  @ManyToMany(() => AttributeModel, {
    cascade: false,
    onDelete: 'NO ACTION',
    nullable: true,
    createForeignKeyConstraints: true,
    persistence: false,
    lazy: true,
  })
  @JoinTable({ name: 'category_assigned_attribute' })
  assignedAttributes: AttributeModel[] | Promise<AttributeModel[]>;

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
  assignedAttributeCount: number;
}
