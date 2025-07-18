import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { CategoryService } from '../services/category.service';
import { AssignAttributesDto } from '../types/assign-attributes.dto';
import { AttributeModel } from '../../../attribute/src/model/attribute.model';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import { In } from 'typeorm';
import { AttributeService } from '../../../attribute/src/services/attribute.service';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SearchQueryInterface } from '@database/mysql-database/search-query-parser';
import { parseHttpQueryToFindOption } from '@database/mysql-database/search-query-parser/parser';
import { SearchQueryResponseInterceptor } from '@database/mysql-database/interceptor/search-query-response-interceptor.service';
import { SafeTransformSearchQueryPipe } from '@database/mysql-database/search-query-parser/pipes/safe-transform-search-query.pipe';
import { LinkTypeEnum } from '../../../category-attribute-index/src/types/link-type.enum';

@Controller('categories/:id/attributes')
export class CategoryAttributesController {
  private supportedKeywordFields = [
    'associatedAttributeLinkages.category.name',
    'name',
    'code',
  ];
  constructor(
    private readonly categoryService: CategoryService,
    private readonly attributeService: AttributeService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get category attributes' })
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
    description: 'Add bonded categories',
  })
  @ApiQuery({
    name: 'linkTypes',
    type: 'enum',
    enum: LinkTypeEnum,
    required: false,
    description: 'Filter by link type',
  })
  @ApiQuery({
    name: 'filterNonAssigned',
    type: 'boolean',
    required: false,
    description: 'Filter by non assigned attributes',
  })
  @UseInterceptors(SearchQueryResponseInterceptor)
  async getCategoryAttributes(
    @Param('id') categoryId: bigint,
    @Query('keyword') keyword: string = '',
    @Query('linkTypes') linkTypes: LinkTypeEnum[] = [],
    @Query('searchQuery', SafeTransformSearchQueryPipe)
    searchQuery: SearchQueryInterface,
    @Query('filterNonAssigned') nonAssignedOnly?: boolean,
  ) {
    const criteria: FindManyOptions<AttributeModel> =
      parseHttpQueryToFindOption(searchQuery);

    return this.attributeService.getListAndCountOnCategories(
      [categoryId],
      keyword,
      linkTypes,
      nonAssignedOnly,
      criteria,
    );
  }

  @Put()
  @ApiOperation({ summary: 'Assign direct attributes to category' })
  async assignOptionsToCategory(
    @Param('id') categoryId: bigint,
    @Body() assignInputs: AssignAttributesDto,
  ) {
    const category = await this.categoryService.getById(categoryId);
    category.assignedAttributes = await this.getAttributeToAssign(assignInputs);
    return this.categoryService.save(category);
  }

  private async getAttributeToAssign(assignInputs: AssignAttributesDto) {
    const attributeCodes = assignInputs.attributes
      .map((attr) => attr.code)
      .filter(Boolean);
    const attributeUuids = assignInputs.attributes
      .map((attr) => attr.uuid)
      .filter(Boolean);

    if (attributeCodes.length || attributeUuids.length) {
      const whereConditions: FindManyOptions<AttributeModel> = {
        where: [
          { code: attributeCodes.length ? In(attributeCodes) : undefined },
          { uuid: attributeUuids.length ? In(attributeUuids) : undefined },
        ],
      };

      return this.attributeService.getList(whereConditions);
    }

    return [];
  }
}
