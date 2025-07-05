import { QueryItemInterface } from '../interface';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import { OPERATOR_MAPPING } from './operator.mapping';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';

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
      item.operation = 'eq';
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      [item.field]: OPERATOR_MAPPING[item.operation](item.value),
    };
  }

  if (!item.operation) {
    item.operation = 'eq';
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    [item.field]: OPERATOR_MAPPING[item.operation](normalizeValue),
  };
}
