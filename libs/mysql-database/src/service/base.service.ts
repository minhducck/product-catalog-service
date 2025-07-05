import {
  BaseEntity,
  DataSource,
  FindOneOptions,
  QueryRunner,
  Repository,
} from 'typeorm';
import { BaseModel } from '../model/base.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Inject } from '@nestjs/common';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import { NoSuchEntityException } from '@common/common/exception/no-such-entity.exception';

export abstract class BaseService<T extends BaseModel | BaseEntity> {
  protected repo: Repository<T>;
  private static initiateConnectionCleaner?: NodeJS.Timeout = undefined;

  protected constructor(
    repo: Repository<T>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    @Inject(EventEmitter2) protected readonly eventEmitter: EventEmitter2,
    protected readonly idFieldName = 'uuid',
    protected readonly eventPrefix = 'service',
  ) {
    this.repo = repo;
  }

  async getById(id: number): Promise<T> {
    return this.wrapToEventContainer(
      `${this.eventPrefix}.get-by-id`,
      { id },
      async () => {
        const items = await this.repo.findOne({
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          where: {
            [this.idFieldName]: id,
          },
        });
        if (!items) {
          throw new NoSuchEntityException(
            `Entity ${this.repo.metadata.name} not found`,
          );
        }
        return items;
      },
    );
  }

  async getList(criteria?: FindManyOptions<T>): Promise<[T[], number]> {
    return this.wrapToEventContainer(
      `${this.eventPrefix}.get-list`,
      { criteria },
      () => this.repo.findAndCount(criteria),
    );
  }

  async getOne(
    criteria: FindOneOptions<T>,
    throwErrorOnEmpty = true,
  ): Promise<T | null> {
    return this.wrapToEventContainer<T | null>(
      `${this.eventPrefix}.get-one`,
      { criteria },
      async () => {
        const entity = await this.repo.findOne(criteria);
        if (!entity && throwErrorOnEmpty) {
          throw new NoSuchEntityException(
            `Entity ${this.repo.metadata.name} not found`,
          );
        }
        return entity;
      },
    );
  }

  async save(entity: T): Promise<T> {
    return this.wrapToTransactionContainer(
      `${this.eventPrefix}.save`,
      async (queryRunner) =>
        queryRunner.manager.save<T>(entity, {
          reload: true,
          transaction: false,
        }),
      { entity },
    );
  }

  async update(id: number, entity: Partial<T>): Promise<T> {
    const entityFromDb = await this.getById(id);
    Object.assign(entityFromDb, entity);
    return this.save(entityFromDb);
  }

  async delete(entity: T) {
    return this.wrapToTransactionContainer(
      `${this.eventPrefix}.delete`,
      async (queryRunner) => queryRunner.manager.remove(entity),
      { entity },
    );
  }

  protected async wrapToTransactionContainer<T = any>(
    event: string,
    actionFn: (queryRunner: QueryRunner) => Promise<T>,
    eventVariables?: object,
  ) {
    const queryRunner = this.dataSource.createQueryRunner('master');
    queryRunner.connection.setOptions({
      trace: true,
      directConnection: true,
      multipleStatements: true,
      monitorCommands: true,
    });
    // await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');
    try {
      const result = await this.wrapToEventContainer(
        event,
        { queryRunner, ...eventVariables },
        async () => actionFn(queryRunner),
      );

      await this.wrapToEventContainer(
        `${event}.commit`,
        { queryRunner, ...eventVariables },
        async () => {
          await queryRunner.commitTransaction();
          await queryRunner.release();
          return result;
        },
      );
      return result;
    } catch (e) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      if (!queryRunner.isReleased) await queryRunner.release();
    }
  }

  protected async wrapToEventContainer<T = any>(
    eventIdPrefix: string,
    variables: object,
    actionFunction: () => Promise<T>,
  ) {
    await this.eventEmitter.emitAsync(`${eventIdPrefix}.before`, {
      ...variables,
    });

    const result = await actionFunction();

    // Subscribe for the event after
    await this.eventEmitter.emitAsync(`${eventIdPrefix}.after`, {
      ...variables,
      result,
    });
    return result;
  }

  async saveBulk(list: T[]) {
    return this.wrapToTransactionContainer<typeof list>(
      `${this.eventPrefix}.save-bulk`,
      async (queryRunner) => queryRunner.manager.save(list),
      { list },
    );
  }

  getRepository() {
    return this.repo;
  }
}
