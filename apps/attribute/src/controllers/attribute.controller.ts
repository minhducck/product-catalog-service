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
import { AttributeOptionService } from '../services/attribute-option.service';
import { SearchQueryInterface } from '@database/mysql-database/search-query-parser';

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
    searchQuery: string | SearchQueryInterface = getDefaultSearchCriteriaDto(),
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
}
