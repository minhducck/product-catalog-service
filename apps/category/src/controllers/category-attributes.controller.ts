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
import { ApiOperation } from '@nestjs/swagger';
import { CategoryAttributeIndexService } from '../../../category-attribute-index/src/services/category-attribute-index.service';
import {
  CompareOperator,
  QueryItemInterface,
  QueryType,
  SearchQueryInterface,
} from '@database/mysql-database/search-query-parser';
import { getDefaultSearchCriteriaDto } from '@database/mysql-database/search-query-parser/types/get-default-search-criteria.dto';
import { parseHttpQueryToFindOption } from '@database/mysql-database/search-query-parser/parser';
import { SearchQueryResponseInterceptor } from '@database/mysql-database/interceptor/search-query-response-interceptor.service';
import { isArray, isString } from 'lodash';

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
    private readonly linkAttribute: CategoryAttributeIndexService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get category attributes' })
  @UseInterceptors(SearchQueryResponseInterceptor)
  async getCategoryAttributes(
    @Param('id') categoryId: bigint,
    @Query('keyword') keyword: string = '',

    @Body('searchQuery')
    searchQuery: string | SearchQueryInterface = getDefaultSearchCriteriaDto(),
  ) {
    const searchQueryObj = isString(searchQuery)
      ? (JSON.parse(searchQuery) as SearchQueryInterface)
      : searchQuery;

    this.useCategoryIdSearch(searchQueryObj, categoryId);
    if (keyword) {
      this.useKeywordSearch(searchQueryObj, keyword);
    }

    const criteria: FindManyOptions<AttributeModel> =
      parseHttpQueryToFindOption(searchQueryObj);

    return this.attributeService.getListAndCountOnCategories(
      [categoryId],
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

  private useKeywordSearch(criteria: SearchQueryInterface, keyword: string) {
    const keywordLikeValue = `%${keyword}%`;

    const groupKeywordConditions: QueryItemInterface[] =
      this.supportedKeywordFields.map(
        (field): QueryItemInterface => ({
          field: field,
          value: keywordLikeValue,
          operation: CompareOperator.LIKE,
        }),
      );
    if (criteria.query) {
      // AND & OR

      let oldQuery = criteria.query;
      if (!isArray(criteria.query)) {
        oldQuery = [criteria.query] as QueryType[];
      }

      criteria.query = {
        operation: CompareOperator.AND,
        value: [
          {
            value: groupKeywordConditions,
            operation: CompareOperator.OR,
          },
          ...(oldQuery as QueryType[]),
        ],
      };
    } else {
      criteria.query = {
        operation: CompareOperator.OR,
        value: groupKeywordConditions,
      };
    }
  }

  private useCategoryIdSearch(
    searchQueryObj: SearchQueryInterface,
    categoryId: bigint,
  ) {
    const categoryQuery: QueryType = {
      operation: CompareOperator.OR,
      value: [
        { field: 'category.uuid', value: categoryId },
        {
          field: 'category.uuid',
          operation: CompareOperator.ISNULL,
          value: true,
        },
      ],
    };

    if (searchQueryObj.query) {
      let oldQuery = searchQueryObj.query;
      if (!isArray(searchQueryObj.query)) {
        oldQuery = [searchQueryObj.query] as QueryType[];
      }

      searchQueryObj.query = {
        operation: CompareOperator.AND,
        value: [categoryQuery, ...(oldQuery as QueryType[])],
      };
    } else {
      searchQueryObj.query = categoryQuery;
    }
  }
}
