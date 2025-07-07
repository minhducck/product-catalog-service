import { isString, merge } from 'lodash';
import {
  QueryItemInterface,
  SearchPaginationInterface,
  SearchQueryInterface,
  SearchSortOrderInterface,
} from './interface';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import { parseQuery } from './parser/parse-query';
import { FindOptionsOrder } from 'typeorm/find-options/FindOptionsOrder';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { isArray } from 'class-validator';
import { And } from 'typeorm';
import { createNestedObjectFromString } from './parser/create-nested-object-from.string';
import { BadRequestException } from '@nestjs/common';

export const DEFAULT_SEARCH_PAGE_SIZE = 100;

export function prepareSortOrder<T>(
  order: SearchSortOrderInterface | SearchSortOrderInterface[],
): FindOptionsOrder<T> {
  if (!isArray(order)) {
    order = [order];
  }
  return order?.reduce<FindOptionsOrder<T>>(
    (prev, current) => ({
      ...prev,
      [current.sortField]: current.direction || 'ASC',
    }),
    {},
  );
}

function parseSubQuery<T>(
  subQuery: QueryItemInterface | QueryItemInterface[],
): object {
  if (isArray(subQuery)) {
    return subQuery.reduce((prev, current) => {
      if (!current.field) {
        throw new BadRequestException('SubQuery field was not specified');
      }
      if (prev[current.field]) {
        prev[current.field] = And(
          prev[current.field],
          parseQuery(current)[current.field],
        );
        return prev;
      }
      return merge(prev, parseQuery(current));
    }, {});
  }

  return subQuery ? parseQuery<T>(subQuery) : {};
}

function prepareQueryCondition<T>(
  query: QueryItemInterface | QueryItemInterface[] | undefined,
) {
  if (typeof query === 'undefined') {
    return {};
  }

  if (isArray(query) && isArray(query?.[0])) {
    // Or query
    const result: object[] = [];
    query.forEach((subQuery) => {
      result.push(parseSubQuery(subQuery));
    });
    return result;
  }

  return parseSubQuery<T>(query);
}

export function preparePagination(pagination?: SearchPaginationInterface) {
  return {
    take: pagination?.limit || DEFAULT_SEARCH_PAGE_SIZE,
    skip:
      (pagination?.limit || DEFAULT_SEARCH_PAGE_SIZE) *
      ((pagination?.page || 1) - 1),
  };
}

export function parseHttpQueryToFindOption<T>(
  searchQuery: string | SearchQueryInterface,
): FindManyOptions<T> {
  try {
    if (isString(searchQuery)) {
      searchQuery = JSON.parse(searchQuery) as SearchQueryInterface;
    }
  } catch (e) {
    throw new BadRequestException(
      'Unable to parse search query. Please check your search query.',
      { cause: e },
    );
  }
  const where: FindOptionsWhere<T>[] | FindOptionsWhere<T> =
    prepareQueryCondition<T>(searchQuery?.query);

  let nestedObject: object | object[] = {};
  if (isArray(where)) {
    nestedObject = [];
    for (let i = 0; i < where.length; i++) {
      nestedObject[i] = {};
      for (const fieldName of Object.keys(where[i])) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        nestedObject[i] = merge(
          nestedObject[i],
          createNestedObjectFromString(fieldName, where[i][fieldName]),
        );
      }
    }
  } else {
    for (const fieldName of Object.keys(where)) {
      nestedObject = createNestedObjectFromString(fieldName, where[fieldName]);
    }
  }

  const order: FindOptionsOrder<T> = searchQuery?.sortOrder
    ? prepareSortOrder(searchQuery.sortOrder)
    : {};
  const pagination: FindManyOptions<T> = preparePagination(
    searchQuery?.pagination,
  );

  return {
    where: nestedObject,
    take: pagination.take,
    skip: pagination.skip,
    order,
  };
}
