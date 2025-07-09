import { ApiProperty } from '@nestjs/swagger/dist/decorators';

export enum CompareOperator {
  EQ = 'eq',
  NEQ = 'neq',
  LT = 'lt',
  LTEQ = 'lteq',
  GT = 'gt',
  GTEQ = 'gteq',
  ISNULL = 'isnull',
  NOTNULL = 'notnull',
  LIKE = 'like',
  IN = 'in',
  AND = 'and',
  OR = 'or',
  BETWEEN = 'between',
  NOT = 'not',
  ANY = 'any',
}
export interface QueryItemInterface {
  field?: string;
  value: any;

  operation: CompareOperator;
}

export class QueryItem implements QueryItemInterface {
  @ApiProperty({ required: false, description: 'Field name' })
  field?: string;

  @ApiProperty({
    required: false,
    description: 'Operation',
    enum: CompareOperator,
    default: CompareOperator.EQ,
  })
  operation: CompareOperator;

  @ApiProperty({
    required: false,
    description: 'Value',
  })
  value: any;
}
