export const searchCategoryAttribute = {
  // Code = '' AND Type = 'Inherit'
  query: [
    [
      {
        field: 'code',
        value: 'attribute_2',
        operation: 'eq',
      },
      {
        field: 'associatedAttributeLinkages.linkType',
        value: 'Inherited',
      },
    ],
    [
      {
        field: 'name',
        operation: 'neq',
        value: 'attribute_10',
      },
    ],
  ],
};
