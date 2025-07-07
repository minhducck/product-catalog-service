import { CompareOperator, QueryItemInterface } from '../interface';
import { isArray, isEmpty } from 'lodash';
import { OPERATOR_MAPPING } from './operator.mapping';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { BadRequestException } from '@nestjs/common';

const isInstanceOfQueryInterface = (
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  instance: QueryItemInterface | any,
): boolean =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  typeof instance === 'object' &&
  (instance?.value || instance?.field || instance?.operation);

export function parseQuery<T>(
  item: QueryItemInterface,
): FindOptionsWhere<T>[] | FindOptionsWhere<T> {
  const normalizeValue: FindOptionsWhere<T> | FindOptionsWhere<T>[] = [];
  if (isEmpty(item)) {
    return {};
  }

  if (isArray(item.value) && !isEmpty(item.value)) {
    for (const subValue of item.value) {
      if (!isInstanceOfQueryInterface(subValue)) {
        normalizeValue.push(subValue);
      } else {
        normalizeValue.push(parseQuery<T>(subValue) as FindOptionsWhere<T>);
      }
    }
  } else if (isInstanceOfQueryInterface(item.value)) {
    normalizeValue.push(parseQuery(item.value) as FindOptionsWhere<T>);
  } else {
    if (!item.operation) {
      item.operation = CompareOperator.EQ;
    }

    if (!item.field) {
      throw new BadRequestException('Query field was not specified');
    }

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      [item.field]: OPERATOR_MAPPING[item.operation](item.value),
    } as FindOptionsWhere<T>;
  }

  if (!item.operation) {
    item.operation = CompareOperator.EQ;
  }

  if (!item.field) {
    throw new BadRequestException('Query field was not specified');
  }
  return {
    [item.field]: OPERATOR_MAPPING[item.operation](normalizeValue),
  } as FindOptionsWhere<T>;
}
