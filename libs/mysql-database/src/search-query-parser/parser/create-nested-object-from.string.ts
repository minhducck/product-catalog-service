import { isArray, merge } from 'lodash';

/**
 * String Format: firstLevel.secondLevel.thirdLevel
 * Destination Object:
 * {
 *   "firstLevel": { "secondLevel": {"thirdLevel": {} } }
 * }
 * @param fieldName
 * @param value
 */
export function createNestedObjectFromString(
  fieldName: string,
  value: any,
): Record<string, any> {
  if (!fieldName) {
    return {};
  }

  const nameElement = fieldName.split('.');
  if (nameElement.length === 1) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return { [nameElement[0]]: value };
  }

  const parentName = nameElement.shift() as string;

  return {
    [parentName]: createNestedObjectFromString(nameElement.join('.'), value),
  };
}
export function createNestedObject(
  data: object[] | object,
): Record<string, any> {
  if (isArray(data)) {
    return data.map((item: object) => createNestedObject(item));
  } else {
    let localObj = {};
    for (const fieldName of Object.keys(data)) {
      localObj = merge(
        localObj,
        createNestedObjectFromString(fieldName, data[fieldName]),
      );
    }

    return localObj;
  }
}
