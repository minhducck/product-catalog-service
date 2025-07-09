import { Body, Controller, Param, Put } from '@nestjs/common';
import { CategoryService } from '../services/category.service';
import { AssignAttributesDto } from '../types/assign-attributes.dto';
import { AttributeModel } from '../../../attribute/src/model/attribute.model';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import { In } from 'typeorm';
import { AttributeService } from '../../../attribute/src/services/attribute.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('categories/:id/attributes')
export class CategoryAttributesController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly attributeService: AttributeService,
  ) {}

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
