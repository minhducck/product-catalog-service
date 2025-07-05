import { ApiProperty } from '@nestjs/swagger/dist/decorators';
import {
  QueryItem,
  SearchPagination,
  SearchQueryInterface,
  SearchSortOrder,
} from '@database/mysql-database/search-query-parser';

export const defaultSearchCriteriaDto: SearchQueryInterface = {
  sortOrder: {
    sortField: 'createdAt',
    direction: 'DESC',
  },
  pagination: {
    limit: 10,
    page: 1,
  },
};

export class DefaultSearchCriteriaDto implements SearchQueryInterface {
  @ApiProperty({ required: false, type: SearchSortOrder })
  sortOrder?: SearchSortOrder | [SearchSortOrder];
  @ApiProperty({ required: false })
  pagination?: SearchPagination;
  @ApiProperty({ required: false })
  query?: QueryItem;
}
