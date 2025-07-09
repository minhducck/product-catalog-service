import { SearchQueryResponse } from '@database/mysql-database/interceptor/search-query-response-interceptor.service';
import { ApiProperty } from '@nestjs/swagger/dist/decorators';
import { CategoryModel } from '../model/category.model';
import { PartialType } from '@nestjs/swagger';

class CategoryOutput
  extends PartialType(CategoryModel)
  implements Partial<CategoryModel>
{
  @ApiProperty({
    description: 'Parent ID',
    type: CategoryModel,
    default: null,
    nullable: true,
  })
  parentCategory: CategoryModel;

  @ApiProperty({ type: CategoryModel, isArray: true })
  children: CategoryModel[];
}

export class CategoryTreeResponse
  implements SearchQueryResponse<CategoryOutput[]>
{
  @ApiProperty({ type: [CategoryOutput] })
  searchResult: CategoryOutput[];

  @ApiProperty({ type: 'number' })
  totalCollectionSize: number;
}
