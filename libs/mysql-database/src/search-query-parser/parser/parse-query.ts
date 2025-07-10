import { CompareOperator, QueryItemInterface } from '../interface';
import { isArray, isEmpty, merge } from 'lodash';
import { OPERATOR_MAPPING } from './operator.mapping';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { BadRequestException } from '@nestjs/common';
import { createNestedObject } from '@database/mysql-database/search-query-parser/parser/create-nested-object-from.string';

const isInstanceOfQueryInterface = (
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  instance: QueryItemInterface | any,
): boolean =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  typeof instance === 'object' &&
  (instance?.value || instance?.field || instance?.operation);

const isGroupConditions = (item: QueryItemInterface) => {
  return (
    item.operation &&
    [CompareOperator.ANY, CompareOperator.OR, CompareOperator.AND].includes(
      item.operation,
    )
  );
};

type SingleFieldQuery = QueryItemInterface;
type CombineFieldsQuery = QueryItemInterface[];
type OrConditionsQuery = QueryItemInterface[][];

export function parseQuery<T>(
  item: SingleFieldQuery | CombineFieldsQuery | OrConditionsQuery,
): FindOptionsWhere<T>[] | FindOptionsWhere<T> {
  const normalizeValue: FindOptionsWhere<T> | FindOptionsWhere<T>[] = [];
  let andQuery: FindOptionsWhere<T> = {};
  let orQuery: FindOptionsWhere<T>[] = [];

  if (isEmpty(item)) {
    return {};
  }
  // Wrap conditions to Group wrapper
  if (isArray(item) && isArray(item?.[0])) {
    return parseQuery({
      operation: CompareOperator.OR,
      value: item,
    } as QueryItemInterface);
  } else if (isArray(item)) {
    return parseQuery({
      operation: CompareOperator.AND,
      value: item,
    } as QueryItemInterface);
  }

  if (isInstanceOfQueryInterface(item.value)) {
    normalizeValue.push(
      parseQuery(item.value as QueryItemInterface) as FindOptionsWhere<T>,
    );
  } else if (isArray(item.value) && !isEmpty(item.value)) {
    const isAndQuery = item.operation === CompareOperator.AND;
    const isOrQuery = item.operation === CompareOperator.OR;
    for (const subValue of item.value) {
      if (!isInstanceOfQueryInterface(subValue)) {
        // @ts-ignore
        normalizeValue.push(subValue);
      } else if (isOrQuery) {
        orQuery = orQuery.concat(parseQuery(subValue));
      } else if (isAndQuery) {
        const subInstance = parseQuery(subValue);
        if (isArray(subInstance)) {
          orQuery = orQuery.concat(parseQuery(subValue));
        } else {
          andQuery = merge(andQuery, parseQuery(subValue));
        }
      } else {
        normalizeValue.push(parseQuery<T>(subValue) as FindOptionsWhere<T>);
      }
    }
  } else {
    if (!item.operation) {
      item.operation = CompareOperator.EQ;
    }

    if (!item.field) {
      throw new BadRequestException('Query field was not specified');
    }

    if (!OPERATOR_MAPPING[item.operation]) {
      throw new BadRequestException('Unknown operation: ' + item.operation);
    }
    return createNestedObject({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      // @ts-ignore
      [item.field]: OPERATOR_MAPPING[item.operation](item.value),
    }) as FindOptionsWhere<T>;
  }

  if (!item.operation) {
    item.operation = CompareOperator.EQ;
  }

  if (isGroupConditions(item)) {
    const arrayNodes = orQuery; // A
    const objectNodes = andQuery; // B

    // final = A * B
    let final;
    const isOrQueryEmpty = isEmpty(orQuery);
    const isAndQueryEmpty = isEmpty(andQuery);

    if (!isOrQueryEmpty && !isAndQueryEmpty) {
      // A OR ( B AND C ) = (A OR B) AND (A OR C)
      // **> A AND ( B OR C ) = (A AND B) OR (A AND C)
      final = orQuery.map((a) => merge(a, andQuery));
    } else if (isAndQueryEmpty) {
      final = orQuery;
    } else if (isOrQueryEmpty) {
      final = andQuery;
    } else {
      throw new BadRequestException(
        `Value for nodes ${item.field} is empty. ${item.operation}`,
      );
    }

    if (
      item.operation === CompareOperator.ANY ||
      item.operation === CompareOperator.OR
    ) {
      return createNestedObject(final);
    }

    return createNestedObject(final);
  }

  if (!item.field) {
    throw new BadRequestException('Query field was not specified');
  }

  return createNestedObject({ [item.field + '']: normalizeValue });
}
