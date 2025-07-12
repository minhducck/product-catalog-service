import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { AttributeService } from '../services/attribute.service';
import { ApiBody, ApiQuery } from '@nestjs/swagger';
import { DefaultSearchCriteriaDto } from '@database/mysql-database/search-query-parser/types/get-default-search-criteria.dto';
import { parseHttpQueryToFindOption } from '@database/mysql-database/search-query-parser/parser';
import { SearchQueryResponseInterceptor } from '@database/mysql-database/interceptor/search-query-response-interceptor.service';
import { AttributeCreationDto } from '../types/attribute-creation.dto';
import { AttributeModel } from '../model/attribute.model';
import { SearchQueryInterface } from '@database/mysql-database/search-query-parser';
import { SafeTransformSearchQueryPipe } from '@database/mysql-database/search-query-parser/pipes/safe-transform-search-query.pipe';

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
    type: 'number',
    isArray: true,
    required: false,
    description: 'Search Keywords',
  })
  @UseInterceptors(SearchQueryResponseInterceptor)
  getAttributeList(
    @Query('searchQuery', SafeTransformSearchQueryPipe)
    searchQuery: SearchQueryInterface,
    @Query('keyword') keyword: string = '',
    @Query('categoryIds') boundedCategoriesIds: bigint[] = [],
  ) {
    return this.attributeService.getListAndCountOnCategories(
      boundedCategoriesIds,
      keyword,
      parseHttpQueryToFindOption(searchQuery),
    );
  }

  @Post()
  @ApiBody({ required: true, type: AttributeCreationDto })
  create(@Body() creationDto: AttributeCreationDto) {
    const entity = AttributeModel.create<AttributeModel>(creationDto);

    return this.attributeService.save(entity);
  }
  @Delete(':id')
  @ApiBody({ required: true, type: AttributeCreationDto })
  async delete(@Param('id') id: bigint) {
    const entity = await this.attributeService.getById(id);

    return this.attributeService.save(entity);
  }
}
