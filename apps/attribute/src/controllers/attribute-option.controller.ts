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
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
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
import { DefaultSearchCriteriaDto } from '@database/mysql-database/search-query-parser/types/get-default-search-criteria.dto';
import { SafeTransformSearchQueryPipe } from '@database/mysql-database/search-query-parser/pipes/safe-transform-search-query.pipe';

@Controller('attributes/:attributeId/options')
@ApiParam({ name: 'attributeId', type: String })
@ApiTags('Manage Attribute Options')
export class AttributeOptionController {
  constructor(
    private readonly attributeService: AttributeService,
    private readonly optionService: AttributeOptionService,
  ) {}

  @Get()
  @UseInterceptors(SearchQueryResponseInterceptor)
  @ApiOperation({ summary: 'Get attribute options' })
  @ApiQuery({
    name: 'searchQuery',
    type: DefaultSearchCriteriaDto,
    required: false,
  })
  getAttributeOptions(
    @Param('attributeId') attrId: bigint,
    @Query('searchQuery', SafeTransformSearchQueryPipe)
    searchQuery: SearchQueryInterface,
  ) {
    this.appendAttributeIdFilter(searchQuery, attrId);
    const searchOptionQuery =
      parseHttpQueryToFindOption<AttributeOptionModel>(searchQuery);

    searchOptionQuery.where = searchOptionQuery.where ?? {};
    searchOptionQuery.where = merge(searchOptionQuery.where, {
      attribute: {
        uuid: Equal(attrId),
      },
    });

    return this.optionService.getListAndCount(searchOptionQuery);
  }

  @Post()
  @ApiOperation({ summary: 'Create attribute option' })
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
  @ApiOperation({ summary: 'Update attribute options' })
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

  private appendAttributeIdFilter(
    searchQuery: SearchQueryInterface,
    attrId: bigint,
  ) {
    searchQuery.query = [
      searchQuery.query,
      { field: 'attribute.uuid', value: attrId },
    ].filter(Boolean) as QueryItemInterface[];
  }
}
