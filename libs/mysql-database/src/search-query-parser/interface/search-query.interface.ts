import { SearchSortOrderInterface } from './search-sort-order.interface';
import { SearchPaginationInterface } from './search-pagination.interface';
import { QueryItemInterface } from './search-query/query-item.interface';

export interface SearchQueryInterface {
  query?: QueryItemInterface;
  sortOrder?: SearchSortOrderInterface | [SearchSortOrderInterface];
  pagination?: SearchPaginationInterface;
}
