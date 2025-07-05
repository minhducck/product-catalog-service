import {
  AfterLoad,
  BeforeInsert,
  CreateDateColumn,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import cloneDeep from 'lodash/cloneDeep';
import { Exclude, instanceToPlain } from 'class-transformer';
import { generateULID } from '@common/common/helper/generate-ulid';

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
  uuid: bigint;

  @BeforeInsert()
  protected generateUUID() {
    this.uuid = generateULID();
  }

  @CreateDateColumn({ name: 'createdAt' })
  @Exclude({ toPlainOnly: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  @Exclude({ toPlainOnly: true })
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
