import {
  DataSource,
  EntityPropertyNotFoundError,
  FindOneOptions,
  QueryFailedError,
  QueryRunner,
  Repository,
} from 'typeorm';
import { BaseModel } from '../model/base.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException, Inject, Logger } from '@nestjs/common';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import { NoSuchEntityException } from '@common/common/exception/no-such-entity.exception';
import { SearchQueryResult } from '@database/mysql-database/interceptor/search-query-response-interceptor.service';
import { omitBy } from 'lodash';
import { AlreadyExistedException } from '@common/common/exception/already-existed.exception';

export abstract class BaseService<T extends BaseModel> {
  protected repo: Repository<T>;
  private static initiateConnectionCleaner?: NodeJS.Timeout = undefined;
  private logger: Logger;

  protected constructor(
    repo: Repository<T>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    @Inject(EventEmitter2) protected readonly eventEmitter: EventEmitter2,
    protected readonly idFieldName: keyof T = 'uuid',
    protected readonly eventPrefix = 'service',
  ) {
    this.repo = repo;
    this.logger = new Logger(this.constructor.name);
  }

  handleErrorCodes(reason: Error): Error {
    this.logger.error(
      `Error occurred while handling database: ${reason.message}`,
    );
    if (reason instanceof QueryFailedError) {
      switch (reason.driverError.code) {
        case 'ER_DUP_ENTRY':
          return new AlreadyExistedException('Duplicate entry found.');
      }
    } else if (reason instanceof EntityPropertyNotFoundError) {
      return new BadRequestException(reason.message);
    }
    return reason;
  }

  async getById(id: bigint): Promise<T> {
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

  async getList(
    criteria?: FindManyOptions<T>,
  ): Promise<SearchQueryResult<T[]>> {
    return this.wrapToEventContainer(
      `${this.eventPrefix}.get-list`,
      { criteria },
      async () => {
        try {
          return this.repo.findAndCount(criteria);
        } catch (reason) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          throw this.handleErrorCodes(reason);
        }
      },
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
        queryRunner.manager
          .save<T>(entity, {
            reload: true,
            listeners: true,
            transaction: false,
          })
          .catch((reason) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            throw this.handleErrorCodes(reason);
          }),
      { entity },
    );
  }

  async update(id: bigint, entity: Partial<T>): Promise<T> {
    const entityFromDb = await this.getById(id);
    Object.assign(
      entityFromDb,
      omitBy(entity, (value) => value === undefined),
    );

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

  isExistId(id: bigint) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return this.repo.existsBy({ [this.idFieldName]: id });
  }

  getRepository() {
    return this.repo;
  }
}
