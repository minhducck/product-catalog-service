import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { AttributeService } from '../services/attribute.service';
import { ApiBody, ApiQuery } from '@nestjs/swagger';
import {
  DefaultSearchCriteriaDto,
  getDefaultSearchCriteriaDto,
} from '@database/mysql-database/search-query-parser/types/get-default-search-criteria.dto';
import { parseHttpQueryToFindOption } from '@database/mysql-database/search-query-parser/parser';
import { SearchQueryResponseInterceptor } from '@database/mysql-database/interceptor/search-query-response-interceptor.service';
import { AttributeCreationDto } from '../types/attribute-creation.dto';
import { AttributeModel } from '../model/attribute.model';
import { SearchQueryInterface } from '@database/mysql-database/search-query-parser';
import { isString } from 'lodash';

@Controller('attributes')
export class AttributeController {
  constructor(private readonly attributeService: AttributeService) {}

  @Get()
  @ApiQuery({
    name: 'searchQuery',
    type: DefaultSearchCriteriaDto,
    required: false,
  })
  @ApiQuery({
    name: 'keyword',
    type: String,
    required: false,
    description: 'Search Keywords',
  })
  @ApiQuery({
    name: 'categoryIds',
    type: [Number],
    required: false,
    description: 'Search Keywords',
  })
  @UseInterceptors(SearchQueryResponseInterceptor)
  getAttributeList(
    @Query('searchQuery')
    searchQuery: string | SearchQueryInterface = getDefaultSearchCriteriaDto(),
    @Query('keyword') keyword: string = '',
    @Query('categoryIds') boundedCategoriesIds: bigint[] = [],
  ) {
    /* @Todo: Implement Category Filter and Keyword filter*/

    console.log(keyword);
    const searchQueryObj = isString(searchQuery)
      ? (JSON.parse(searchQuery) as SearchQueryInterface)
      : searchQuery;

    return this.attributeService.getListAndCountOnCategories(
      boundedCategoriesIds,
      parseHttpQueryToFindOption(searchQueryObj),
    );
  }

  @Post()
  @ApiBody({ required: true, type: AttributeCreationDto })
  create(@Body() creationDto: AttributeCreationDto) {
    const entity = AttributeModel.create<AttributeModel>(creationDto);

    return this.attributeService.save(entity);
  }
}
