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
import { SearchQueryInterface } from '@database/mysql-database/search-query-parser';
import { getDefaultSearchCriteriaDto } from '@database/mysql-database/search-query-parser/types/get-default-search-criteria.dto';
import { parseHttpQueryToFindOption } from '@database/mysql-database/search-query-parser/parser';
import { SearchQueryResponseInterceptor } from '@database/mysql-database/interceptor/search-query-response-interceptor.service';
import { isArray, merge } from 'lodash';

@Controller('categories/:id/attributes')
export class CategoryAttributesController {
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
    @Query('searchQuery')
    searchQuery: string | SearchQueryInterface = getDefaultSearchCriteriaDto(),
  ) {
    const criteria: FindManyOptions<AttributeModel> =
      parseHttpQueryToFindOption(searchQuery);
    const additionalWhere = {
      associatedAttributeLinkages: { category: { uuid: categoryId } },
    };

    // Normal And
    if (criteria.where && !isArray(criteria.where)) {
      criteria.where = merge(criteria.where, additionalWhere);
    } else if (criteria.where && isArray(criteria.where)) {
      // Or
      criteria.where = criteria.where.map((where) =>
        merge(where, additionalWhere),
      );
    } else {
      criteria.where = additionalWhere;
    }

    return this.attributeService.getListAndCount({
      ...criteria,
      loadEagerRelations: true,
      relations: {
        associatedAttributeLinkages: true,
      },
      select: {
        associatedAttributeLinkages: {
          linkType: true,
        },
      },
    });
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
