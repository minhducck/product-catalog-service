import {
  AfterLoad,
  BeforeInsert,
  CreateDateColumn,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { cloneDeep } from 'lodash';
import { Exclude, instanceToPlain } from 'class-transformer';
import { generateULID } from '@common/common/helper/generate-ulid';
import { ApiResponseProperty } from '@nestjs/swagger/dist/decorators';

export class BaseModel<T = any> {
  #originData: object;

  constructor(init?: Partial<T>) {
    Object.assign(this, init ?? {});
  }

  @PrimaryColumn({
    type: 'bigint',
    unsigned: true,
    primary: true,
  })
  @ApiResponseProperty({ type: 'string' })
  uuid: bigint;

  @BeforeInsert()
  protected generateUUID() {
    this.uuid = generateULID();
  }

  @CreateDateColumn({ name: 'createdAt' })
  @ApiResponseProperty({ type: 'string' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  @ApiResponseProperty({ type: 'string' })
  updatedAt: Date;

  @AfterLoad()
  protected originalObjectData() {
    this.#originData = cloneDeep(this);
  }

  @Exclude({ toPlainOnly: true })
  getOriginData() {
    return this.#originData;
  }

  toJSON() {
    return instanceToPlain(this);
  }
}
