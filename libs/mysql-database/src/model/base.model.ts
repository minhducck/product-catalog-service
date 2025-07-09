import {
  AfterLoad,
  BeforeInsert,
  CreateDateColumn,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { cloneDeep, omitBy } from 'lodash';
import { Exclude, instanceToPlain } from 'class-transformer';
import { generateULID } from '@common/common/helper/generate-ulid';
import { ApiResponseProperty } from '@nestjs/swagger/dist/decorators';

export class BaseModel<T = any> {
  #originData: object;

  constructor(init?: Partial<T>) {
    Object.assign(
      this,
      omitBy(init ?? {}, (value) => value === undefined),
    );
  }

  public static create<TEntity extends BaseModel>(entity: Partial<TEntity>) {
    const instance = new this<TEntity>();
    Object.assign(
      instance,
      omitBy(entity ?? {}, (value) => value === undefined),
    );
    return instance as TEntity;
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
