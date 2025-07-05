import { ApiProperty } from '@nestjs/swagger/dist/decorators';
import { FindOptionsOrderValue } from 'typeorm';

export interface SearchSortOrderInterface {
  sortField: string;
  direction: FindOptionsOrderValue;
}

export class SearchSortOrder implements SearchSortOrderInterface {
  @ApiProperty()
  direction: FindOptionsOrderValue;
  @ApiProperty()
  sortField: string;
}
