import {
  Not,
  Equal,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  In,
  Like,
  IsNull,
  Between,
  Any,
  And,
} from 'typeorm';

export const OPERATOR_MAPPING: Record<string, any> = {
  not: Not,
  eq: Equal,
  lt: LessThan,
  lteq: LessThanOrEqual,
  gt: MoreThan,
  gteq: MoreThanOrEqual,
  in: In,
  like: Like,
  isnull: IsNull,
  notnull: () => Not(IsNull()),
  between: Between,
  any: Any,
  // // and: And,
  // and: (...params) => params,
  // or: function (...params) {
  //   console.log(params);
  //   return params;
  // },
};
