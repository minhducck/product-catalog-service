import { Inject, Injectable } from '@nestjs/common';
import { BaseService } from '@database/mysql-database/service/base.service';
import { AttributeModel } from '../model/attribute.model';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, IsNull, Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import { SearchQueryResult } from '@database/mysql-database/interceptor/search-query-response-interceptor.service';
import { isArray, merge } from 'lodash';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';

@Injectable()
export class AttributeService extends BaseService<AttributeModel> {
  constructor(
    @InjectRepository(AttributeModel)
    protected readonly repo: Repository<AttributeModel>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    @Inject(EventEmitter2) protected readonly eventEmitter: EventEmitter2,
  ) {
    const idFieldName = 'uuid';
    const eventPrefix = 'attribute-service';
    super(repo, dataSource, eventEmitter, idFieldName, eventPrefix);
  }

  async getListAndCountOnCategories(
    categoryIds: bigint[] = [],
    criteria: FindManyOptions<AttributeModel> = {},
  ): Promise<SearchQueryResult<AttributeModel[]>> {
    const repository = this.getRepository();
    const metadata = repository.metadata;
    const queryBuilder = repository.createQueryBuilder(metadata.name);
    const additionalWhere: FindOptionsWhere<AttributeModel> = {};
    if (categoryIds.length) {
      additionalWhere.associatedAttributeLinkages = {
        category: [{ uuid: In(categoryIds) }, { uuid: IsNull() }],
      };
    } else {
      additionalWhere.associatedAttributeLinkages = {
        category: { uuid: IsNull() },
      };
    }

    if (criteria.where && !isArray(criteria.where)) {
      criteria.where = merge(criteria.where, additionalWhere);
    } else if (criteria.where && isArray(criteria.where)) {
      // Or
      criteria.where = criteria.where.map((where) =>
        merge(where, additionalWhere),
      );
    } else {
      criteria.where = additionalWhere;
    }

    const criteriaWithCategoryIds: FindManyOptions<AttributeModel> = {
      ...(criteria || {}),
      loadEagerRelations: false,
      relations: {
        associatedAttributeLinkages: { category: true },
      },
      select: {
        associatedAttributeLinkages: {
          linkType: true,
          category: { uuid: true, name: true },
        },
      },
    };

    queryBuilder.setFindOptions(criteriaWithCategoryIds);
    return queryBuilder.getManyAndCount();
  }
}
