import { BaseModel } from '@database/mysql-database/model/base.model';
import { AttributeDataTypeEnum } from '../types/attribute-data-type.enum';
import { Entity } from 'typeorm';

@Entity({ name: 'attributes' })
export class AttributeModel extends BaseModel<AttributeModel> {
  name: string;

  dataType: AttributeDataTypeEnum;

  isGlobal: boolean;
  isVisibleOnFrontend: boolean;
  isInheritedAllowed: boolean;
}
