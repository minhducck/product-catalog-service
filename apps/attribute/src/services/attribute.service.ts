import { Inject, Injectable } from '@nestjs/common';
import { BaseService } from '@database/mysql-database/service/base.service';
import { AttributeModel } from '../model/attribute.model';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import { SearchQueryResult } from '@database/mysql-database/interceptor/search-query-response-interceptor.service';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { isArray, isObject, merge } from 'lodash';
import { createNestedObject } from '@database/mysql-database/search-query-parser/parser/create-nested-object-from.string';
import { CategoryAttributeIndexModel } from '../../../category-attribute-index/src/model/category-attribute-index.model';
import { LinkTypeEnum } from '../../../category-attribute-index/src/types/link-type.enum';

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
    keyword: string = '',
    linkTypes: LinkTypeEnum[] = [],
    nonAssignedOnly: boolean = false,
    criteria: FindManyOptions<AttributeModel> = {},
    supportedKeywordFields = ['name', 'code'],
  ): Promise<SearchQueryResult<AttributeModel[]>> {
    const repository = this.getRepository();
    const metadata = repository.metadata;
    const queryBuilder = repository.createQueryBuilder(metadata.name);
    let additionalWhereKeyword:
      | FindOptionsWhere<AttributeModel>
      | FindOptionsWhere<AttributeModel>[] = {};

    if (keyword) {
      keyword = keyword.trim();
      additionalWhereKeyword = supportedKeywordFields.map((field) =>
        createNestedObject({ [field]: ILike(`%${keyword}%`) }),
      );
    }
    this.appendConditionToCriteria(criteria, additionalWhereKeyword);
    const criteriaWithCategoryIds: FindManyOptions<AttributeModel> = {
      ...(criteria || {}),
      loadEagerRelations: false,
    };

    if (categoryIds.length) {
      queryBuilder.leftJoinAndMapMany(
        'AttributeModel.associatedAttributeLinkages',
        CategoryAttributeIndexModel,
        'associatedAttributeLinkages',
        `associatedAttributeLinkages.attributeUuid = AttributeModel.uuid AND (associatedAttributeLinkages.categoryUuid IN (:categoryIds) OR associatedAttributeLinkages.linkType = :linkType)`,
        { categoryIds, linkType: LinkTypeEnum.GLOBAL },
      );
      queryBuilder.addSelect('associatedAttributeLinkages.category.uuid');
      if (linkTypes.length) {
        queryBuilder.andWhere(
          `associatedAttributeLinkages.linkType IN (:linkTypes)`,
          { linkTypes },
        );
      }

      if (nonAssignedOnly) {
        queryBuilder.andWhere(
          `associatedAttributeLinkages.attributeUuid IS NULL`,
        );
      }
    }

    queryBuilder.setFindOptions(criteriaWithCategoryIds);
    return queryBuilder.getManyAndCount();
  }

  private appendConditionToCriteria(
    criteria: FindManyOptions<AttributeModel>,
    additionalWhere:
      | FindOptionsWhere<AttributeModel>
      | FindOptionsWhere<AttributeModel>[],
  ) {
    const mergeWhereObj = (
      where?:
        | FindOptionsWhere<AttributeModel>
        | FindOptionsWhere<AttributeModel>[],
      additionalWhere?:
        | FindOptionsWhere<AttributeModel>
        | FindOptionsWhere<AttributeModel>[],
    ) => {
      // Case 1: If one of them is undefined or null, return the other
      if (!where && additionalWhere) {
        return additionalWhere;
      }
      if (where && !additionalWhere) {
        return where;
      }

      if (isArray(where) && isArray(additionalWhere)) {
        return where.concat(additionalWhere);
      }

      if (isArray(where) && isObject(additionalWhere)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return where.map(
          (item) =>
            mergeWhereObj(
              item,
              additionalWhere,
            ) as FindOptionsWhere<AttributeModel>,
        );
      }
      if (isArray(additionalWhere) && isObject(where)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return additionalWhere.map((item) => mergeWhereObj(where, item) || {});
      }

      // Case 4: If both are objects, perform a deep merge
      if (isObject(where) && isObject(additionalWhere)) {
        return merge({}, where, additionalWhere);
      }

      // Default case: Return undefined (unlikely to occur)
      return undefined;
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    criteria.where = mergeWhereObj(criteria.where, additionalWhere);
  }
}
