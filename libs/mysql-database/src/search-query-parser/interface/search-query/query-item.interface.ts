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
  value:
    | QueryItemInterface
    | QueryItemInterface[]
    | string
    | number
    | bigint
    | boolean
    | null
    | undefined;

  operation?: CompareOperator;
}

export class QueryItem implements QueryItemInterface {
  @ApiProperty({ required: false, description: 'Field name' })
  field?: string;

  @ApiProperty({
    required: false,
    description: 'Operation',
    enum: CompareOperator,
    default: CompareOperator.EQ,
    examples: [...Object.keys(CompareOperator)],
  })
  operation: CompareOperator;

  @ApiProperty({
    required: false,
    description: 'Value',
    type: 'string',
    examples: ['123', '123.456', 'true', 'false', 'null'],
  })
  value: string | number | bigint | boolean | null | undefined;
}
