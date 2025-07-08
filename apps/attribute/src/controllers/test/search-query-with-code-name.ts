import {
  CompareOperator,
  SearchQueryInterface,
} from '@database/mysql-database/search-query-parser';

export const searchQueryWithCodeName: SearchQueryInterface = {
  query: [
    {
      field: 'code',
      value: '%test%',
      operation: CompareOperator.LIKE,
    },
  ],
};
