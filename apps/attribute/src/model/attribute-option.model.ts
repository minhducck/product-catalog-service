import { BaseModel } from '@database/mysql-database/model/base.model';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { AttributeModel } from './attribute.model';
import { Exclude } from 'class-transformer';

@Entity({ name: 'attribute_options', comment: 'Attribute options' })
@Unique(['attribute', 'optionValueData'])
export class AttributeOptionModel extends BaseModel<AttributeOptionModel> {
  @JoinColumn()
  @ManyToOne(() => AttributeModel, (attribute) => attribute.options)
  @Exclude({ toPlainOnly: true })
  attribute?: AttributeModel;

  @Column({ type: 'varchar', length: 255, nullable: true })
  optionValueData: string;

  attributeUuid?: bigint;

  @BeforeInsert()
  @BeforeUpdate()
  protected populateAttributeId() {
    if (this.attribute && this.attribute.uuid) {
      this.attributeUuid = this.attribute.uuid;
    }
  }
}
