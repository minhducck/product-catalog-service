import { SearchQueryResponse } from '@database/mysql-database/interceptor/search-query-response-interceptor.service';
import { CategoryTreeType } from './category-tree.type';
import { ApiProperty } from '@nestjs/swagger/dist/decorators';
import { CategoryModel } from '../model/category.model';

export class CategoryTreeResponse
  implements SearchQueryResponse<CategoryTreeType>
{
  @ApiProperty({ type: CategoryModel, isArray: true })
  searchResult: CategoryModel[];

  @ApiProperty({ type: 'number' })
  totalCollectionSize: number;
}
