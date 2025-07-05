import { BaseModel } from '@database/mysql-database/model/base.model';
import { Column, Entity } from 'typeorm';
import { EntityTypeEnum } from '../types/entity-type.enum';

@Entity({
  name: 'entities',
  schema: 'entities',
  synchronize: true,
  comment: 'Entities table',
})
export class EntityModel extends BaseModel<EntityModel> {
  @Column({
    type: 'enum',
    enum: EntityTypeEnum,
    nullable: false,
    comment: 'Entity Type',
  })
  entityType: EntityTypeEnum;
}
