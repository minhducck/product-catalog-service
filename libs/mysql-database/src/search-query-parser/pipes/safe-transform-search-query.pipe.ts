import { ArgumentMetadata, PipeTransform } from '@nestjs/common';
import { SearchQueryInterface } from '@database/mysql-database/search-query-parser';
import { getDefaultSearchCriteriaDto } from '@database/mysql-database/search-query-parser/types/get-default-search-criteria.dto';
import { safeParseSearchQuery } from '@database/mysql-database/search-query-parser/parser';

export class SafeTransformSearchQueryPipe implements PipeTransform {
  transform(
    value: string | SearchQueryInterface | undefined,
    metadata: ArgumentMetadata,
  ) {
    if (!value) return getDefaultSearchCriteriaDto();
    return safeParseSearchQuery(value);
  }
}
