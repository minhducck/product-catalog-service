import { ApiProperty } from '@nestjs/swagger/dist/decorators';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export interface SearchPaginationInterface {
  page: number;
  limit: number;
}
export class SearchPagination implements SearchPaginationInterface {
  @ApiProperty({ default: 10, type: 'number' })
  @IsNumber()
  @Min(1)
  @Max(20_000)
  @IsOptional()
  limit: number;

  @ApiProperty({ default: 1, type: 'number' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  page: number;
}
