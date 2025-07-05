import { ApiProperty } from '@nestjs/swagger/dist/decorators';

export interface SearchPaginationInterface {
  page: number;
  limit: number;
}
export class SearchPagination implements SearchPaginationInterface {
  @ApiProperty()
  limit: number;
  @ApiProperty()
  page: number;
}
