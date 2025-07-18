import { ApiProperty, ApiSchema } from '@nestjs/swagger/dist/decorators';
import {
  QueryItem,
  QueryType,
  SearchPagination,
  SearchQueryInterface,
  SearchSortOrder,
} from '@database/mysql-database/search-query-parser';
import { IsInstance, IsOptional } from 'class-validator';

export const getDefaultSearchCriteriaDto = (): SearchQueryInterface =>
  ({
    sortOrder: {
      sortField: 'createdAt',
      direction: 'DESC',
    },
    pagination: {
      limit: 10,
      page: 1,
    },
    query: {} as QueryItem,
  }) as SearchQueryInterface;

@ApiSchema()
export class DefaultSearchCriteriaDto implements SearchQueryInterface {
  @ApiProperty({ required: false, type: SearchSortOrder })
  @IsOptional()
  @IsInstance(SearchSortOrder)
  sortOrder?: SearchSortOrder | [SearchSortOrder];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInstance(SearchPagination)
  pagination?: SearchPagination;

  @ApiProperty({ type: QueryItem, required: false })
  @IsOptional()
  @IsInstance(QueryItem)
  query?: QueryType;
}
