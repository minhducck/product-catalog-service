import { Controller, Get } from '@nestjs/common';
import { AttributeService } from './attribute.service';
import { ApiParam } from '@nestjs/swagger';
import { DefaultSearchCriteriaDto } from '@database/mysql-database/search-query-parser/types/default-search-criteria.dto';

@Controller('attributes')
export class AttributeController {
  constructor(private readonly attributeService: AttributeService) {}

  @Get()
  @ApiParam({ name: 'searchQuery', type: DefaultSearchCriteriaDto })
  getAttributeList() {
    return this.attributeService.getList();
  }
}
