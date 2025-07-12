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
import { BadRequestException } from '@nestjs/common';

export const DEFAULT_SEARCH_PAGE_SIZE = 100;
export const DEFAULT_SORT_FIELD = 'createdAt';
export const DEFAULT_SORT_DIRECTION = 'DESC';

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

function prepareQueryCondition<T>(
  query:
    | QueryItemInterface
    | QueryItemInterface[]
    | QueryItemInterface[][]
    | undefined,
) {
  if (typeof query === 'undefined') {
    return {};
  }
  return parseQuery(query);
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
  searchQuery: SearchQueryInterface,
): FindManyOptions<T> {
  const where: FindOptionsWhere<T>[] | FindOptionsWhere<T> =
    prepareQueryCondition<T>(searchQuery?.query);

  const order: FindOptionsOrder<T> = searchQuery?.sortOrder
    ? prepareSortOrder(searchQuery.sortOrder)
    : {};
  const pagination: FindManyOptions<T> = preparePagination(
    searchQuery?.pagination,
  );

  return {
    where,
    take: pagination.take,
    skip: pagination.skip,
    order,
  };
}

export const safeParseSearchQuery = (
  searchQuery: string | SearchQueryInterface,
) => {
  try {
    if (typeof searchQuery === 'string') {
      return JSON.parse(searchQuery) as SearchQueryInterface;
    }
  } catch (e) {
    throw new BadRequestException(
      'Unable to parse search query. Please check your search query.',
      { cause: e },
    );
  }
};
export const initiateSearchParamParams = (
  query: SearchQueryInterface['query'],
  pagination: SearchQueryInterface['pagination'],
  sortOrder: SearchQueryInterface['sortOrder'],
): SearchQueryInterface => {
  return {
    query,
    pagination:
      pagination ||
      ({
        page: 1,
        limit: DEFAULT_SEARCH_PAGE_SIZE,
      } as SearchPaginationInterface),
    sortOrder:
      sortOrder ||
      ({
        sortField: DEFAULT_SORT_FIELD,
        direction: DEFAULT_SORT_DIRECTION,
      } as SearchSortOrderInterface),
  } as SearchQueryInterface;
};
