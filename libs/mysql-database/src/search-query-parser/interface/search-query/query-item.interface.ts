import { ApiProperty } from '@nestjs/swagger/dist/decorators';

export interface QueryItemInterface {
  field: string;
  value: any;

  operation:
    | 'eq'
    | 'lt'
    | 'lteq'
    | 'gt'
    | 'gteq'
    | 'isnull'
    | 'notnull'
    | 'like'
    | 'in'
    | 'and'
    | 'or'
    | 'between'
    | 'not'
    | 'any';
}

export class QueryItem implements QueryItemInterface {
  @ApiProperty()
  field: string;
  @ApiProperty()
  operation:
    | 'eq'
    | 'lt'
    | 'lteq'
    | 'gt'
    | 'gteq'
    | 'isnull'
    | 'notnull'
    | 'like'
    | 'in'
    | 'and'
    | 'or'
    | 'between'
    | 'not'
    | 'any';
  @ApiProperty()
  value: any;
}
