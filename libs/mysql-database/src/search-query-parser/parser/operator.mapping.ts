import {
  And,
  Any,
  Between,
  Equal,
  EqualOperator,
  FindOperator,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
} from 'typeorm';

export const OPERATOR_MAPPING: {
  not: <T>(value: FindOperator<T> | T) => FindOperator<T>;
  eq: <T>(value: FindOperator<T> | T) => EqualOperator<T>;
  neq: <T>(value: FindOperator<T> | T) => FindOperator<T>;
  lt: <T>(value: FindOperator<T> | T) => FindOperator<T>;
  lteq: <T>(value: FindOperator<T> | T) => FindOperator<T>;
  gt: <T>(value: FindOperator<T> | T) => FindOperator<T>;
  gteq: <T>(value: FindOperator<T> | T) => FindOperator<T>;
  in: <T>(value: readonly T[] | FindOperator<T>) => FindOperator<any>;
  nin: <T>(value: readonly T[] | FindOperator<T>) => FindOperator<any>;
  like: <T>(value: FindOperator<T> | T) => FindOperator<T>;
  isnull: () => FindOperator<any>;
  notnull: () => FindOperator<any>;
  between: <T>(
    from: FindOperator<T> | T,
    to: FindOperator<T> | T,
  ) => FindOperator<T>;
  any: <T>(value: readonly T[] | FindOperator<T>) => FindOperator<T>;
  or: <T>(value: readonly T[] | FindOperator<T>) => FindOperator<T>;
  and: (...params: FindOperator<any>[]) => FindOperator<any>;
} = {
  not: Not,
  eq: Equal,
  neq: (value) => Not(Equal(value)),
  lt: LessThan,
  lteq: LessThanOrEqual,
  gt: MoreThan,
  gteq: MoreThanOrEqual,
  in: In,
  nin: (value) => Not(In(value)),
  like: Like,
  isnull: IsNull,
  notnull: () => Not(IsNull()),
  between: Between,
  any: Any,
  and: And,
  or: Any,
  // and: (...params) => params,
  // or: function (...params) {
  //   console.log(params);
  //   return params;
  // },
};
