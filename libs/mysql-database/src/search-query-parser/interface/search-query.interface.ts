import { SearchSortOrderInterface } from './search-sort-order.interface';
import { SearchPaginationInterface } from './search-pagination.interface';
import {
  CompareOperator,
  QueryItemInterface,
} from './search-query/query-item.interface';

export type QueryType =
  | QueryItemInterface
  | {
      operation: CompareOperator.AND | CompareOperator.OR | CompareOperator.ANY;
      value: QueryType[];
    };

export interface SearchQueryInterface {
  query?: QueryType | QueryType[] | QueryType[][];
  sortOrder?: SearchSortOrderInterface | [SearchSortOrderInterface];
  pagination?: SearchPaginationInterface;
}
