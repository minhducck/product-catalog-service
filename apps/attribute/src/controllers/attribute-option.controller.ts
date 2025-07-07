import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
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
import { AttributeOptionService } from '../services/attribute-option.service';
import { AttributeOptionModel } from '../model/attribute-option.model';
import { Equal } from 'typeorm';
import { merge } from 'lodash';
import {
  QueryItemInterface,
  SearchQueryInterface,
} from '@database/mysql-database/search-query-parser';
import { AttributeOptionCreationDto } from '../types/attribute-option-creation.dto';
import { AttributeOptionUpdateDto } from '../types/attribute-option-update.dto';

@Controller('attributes/:attributeId/options')
export class AttributeOptionController {
  constructor(
    private readonly attributeService: AttributeService,
    private readonly optionService: AttributeOptionService,
  ) {}

  @Get()
  @UseInterceptors(SearchQueryResponseInterceptor)
  @ApiQuery({ name: 'searchQuery', type: DefaultSearchCriteriaDto })
  getAttributeOptions(
    @Param('attributeId') attrId: bigint,
    @Query()
    searchQuery: SearchQueryInterface = getDefaultSearchCriteriaDto(),
  ) {
    searchQuery.query = [
      searchQuery.query,
      { field: 'attribute.uuid', value: attrId },
    ].filter(Boolean) as QueryItemInterface[];
    const searchOptionQuery =
      parseHttpQueryToFindOption<AttributeOptionModel>(searchQuery);

    searchOptionQuery.where = searchOptionQuery.where ?? {};
    searchOptionQuery.where = merge(searchOptionQuery.where, {
      attribute: {
        uuid: Equal(attrId),
      },
    });

    return this.optionService.getList(searchOptionQuery);
  }

  @Post()
  @ApiBody({ required: true, type: AttributeOptionCreationDto })
  async createAttributeOption(
    @Param('attributeId') id: bigint,
    @Body() optionDto: AttributeOptionCreationDto,
  ): Promise<AttributeOptionModel> {
    const attribute = await this.attributeService.getById(id);
    const newOption = AttributeOptionModel.create<AttributeOptionModel>({
      ...optionDto,
      attribute: attribute,
    });

    return this.optionService.save(newOption);
  }

  @Put('/:optionId')
  @ApiBody({ required: true, type: AttributeOptionUpdateDto })
  async updateOption(
    @Param('optionId') optionId: bigint,
    @Body() optionDto: AttributeOptionUpdateDto,
  ): Promise<AttributeOptionModel> {
    return this.optionService.update(optionId, optionDto);
  }

  @Delete('/:optionId')
  @ApiBody({ required: true, type: AttributeOptionUpdateDto })
  async deleteOption(
    @Param('optionId') id: bigint,
  ): Promise<AttributeOptionModel> {
    const option = await this.optionService.getById(id);
    return this.optionService.delete(option);
  }
}
