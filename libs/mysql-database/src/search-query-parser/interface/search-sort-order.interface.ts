import { ApiProperty } from '@nestjs/swagger/dist/decorators';
import { FindOptionsOrderValue } from 'typeorm';

export interface SearchSortOrderInterface {
  sortField: string;
  direction: FindOptionsOrderValue;
}

export enum SortOrderDirectionEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class SearchSortOrder implements SearchSortOrderInterface {
  @ApiProperty({
    default: SortOrderDirectionEnum.DESC,
    enum: SortOrderDirectionEnum,
  })
  direction: FindOptionsOrderValue;

  @ApiProperty({ default: 'createdAt' })
  sortField: string;
}
