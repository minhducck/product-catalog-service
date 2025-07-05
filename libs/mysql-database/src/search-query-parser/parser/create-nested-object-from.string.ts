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
