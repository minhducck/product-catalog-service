import { BaseModel } from '@database/mysql-database/model/base.model';
import { AttributeDataTypeEnum } from '../types/attribute-data-type.enum';
import { Column, Entity, OneToMany } from 'typeorm';
import { AttributeOptionModel } from './attribute-option.model';
import { CategoryAttributeIndexModel } from '../../../category-attribute-index/src/model/category-attribute-index.model';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger/dist/decorators';

@Entity({ name: 'attributes' })
export class AttributeModel extends BaseModel<AttributeModel> {
  @Column({
    type: 'varchar',
    nullable: false,
    length: 255,
    unique: true,

    comment: 'Attribute Code',
  })
  @ApiProperty({ description: 'Code', type: 'string' })
  code: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    comment: 'Attribute Name',
  })
  name: string;

  @Column({
    type: 'enum',
    enum: AttributeDataTypeEnum,
    nullable: false,
    comment: 'Attribute Data Type',
  })
  dataType: AttributeDataTypeEnum;

  @Column({
    type: 'bool',
    default: false,
    nullable: false,
    comment: 'Is Global Attribute',
  })
  isGlobal: boolean;

  @Column({
    type: 'bool',
    default: false,
    nullable: false,
    comment: 'Is Visible Attribute',
  })
  isVisibleOnFrontend: boolean;

  @Column({
    type: 'bool',
    default: false,
    nullable: false,
    comment: 'Is Inherited Allowed Attribute',
  })
  isInheritedAllowed: boolean;

  @Column({
    type: 'bool',
    default: false,
    nullable: false,
    comment: 'Is Value Required',
  })
  isValueRequired: boolean;

  @OneToMany(() => AttributeOptionModel, (option) => option.attribute, {
    eager: true,
    nullable: true,
    cascade: true,
    persistence: true,
  })
  options?: AttributeOptionModel[];

  @OneToMany(
    () => CategoryAttributeIndexModel,
    (catAttrIndex) => catAttrIndex.attribute,
    {
      eager: false,
      nullable: true,
      lazy: true,
    },
  )
  @Exclude({ toPlainOnly: true })
  associatedAttributeLinkages: AttributeOptionModel[];
}
