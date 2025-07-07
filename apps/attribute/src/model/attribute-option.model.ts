import { BaseModel } from '@database/mysql-database/model/base.model';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AttributeModel } from './attribute.model';
import { OptionEntryClass } from '../types/option-entry.class';

@Entity({ name: 'attribute_options' })
export class AttributeOptionModel extends BaseModel<AttributeOptionModel> {
  @ManyToOne(
    () => AttributeModel,
    (attribute: AttributeModel) => attribute.options,
    { lazy: true, nullable: true, createForeignKeyConstraints: true },
  )
  @JoinColumn({ name: 'attributeId' })
  attribute: AttributeModel;

  @Column({
    type: 'json',
    // default: () => ({
    //   value: null,
    //   metadata: {
    //     dataTypes: 'string',
    //   },
    // }),
  })
  optionValueData: OptionEntryClass;
}
