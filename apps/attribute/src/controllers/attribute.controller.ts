import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { AttributeService } from '../services/attribute.service';
import { ApiBody, ApiQuery } from '@nestjs/swagger';
import {
  defaultSearchCriteriaDto,
  DefaultSearchCriteriaDto,
} from '@database/mysql-database/search-query-parser/types/default-search-criteria.dto';
import { parseHttpQueryToFindOption } from '@database/mysql-database/search-query-parser/parser';
import { SearchQueryResponseInterceptor } from '@database/mysql-database/interceptor/search-query-response-interceptor.service';
import { AttributeCreationDto } from '../types/attribute-creation.dto';
import { AttributeModel } from '../model/attribute.model';
import { AttributeOptionService } from '../services/attribute-option.service';
import { AttributeOptionModel } from '../model/attribute-option.model';
import { Equal } from 'typeorm';
import { merge } from 'lodash';
import {
  QueryItemInterface,
  SearchQueryInterface,
} from '@database/mysql-database/search-query-parser';

@Controller('attributes')
export class AttributeController {
  constructor(
    private readonly attributeService: AttributeService,
    private readonly optionService: AttributeOptionService,
  ) {}

  @Get()
  @ApiQuery({
    name: 'searchQuery',
    type: DefaultSearchCriteriaDto,
    required: false,
  })
  @UseInterceptors(SearchQueryResponseInterceptor)
  getAttributeList(
    @Query('searchQuery')
    searchQuery: string | SearchQueryInterface = defaultSearchCriteriaDto,
  ) {
    return this.attributeService.getList(
      parseHttpQueryToFindOption(searchQuery),
    );
  }

  @Post()
  @ApiBody({ required: true, type: AttributeCreationDto })
  create(@Body() creationDto: AttributeCreationDto) {
    const entity = AttributeModel.create<AttributeModel>(creationDto);

    return this.attributeService.save(entity);
  }

  @Get('/:id/options')
  @UseInterceptors(SearchQueryResponseInterceptor)
  @ApiQuery({ name: 'searchQuery', type: DefaultSearchCriteriaDto })
  getAttributeOptions(
    @Param('id') id: bigint,
    @Query('searchQuery')
    searchQuery: SearchQueryInterface = defaultSearchCriteriaDto,
  ) {
    console.log(searchQuery);
    searchQuery.query = [
      searchQuery.query,
      { field: 'attribute.uuid', value: id },
    ].filter(Boolean) as QueryItemInterface[];
    const searchOptionQuery =
      parseHttpQueryToFindOption<AttributeOptionModel>(searchQuery);

    searchOptionQuery.where = searchOptionQuery.where ?? {};
    searchOptionQuery.where = merge(searchOptionQuery.where, {
      attribute: {
        uuid: Equal(id),
      },
    });

    return this.optionService.getList(searchOptionQuery);
  }
}
