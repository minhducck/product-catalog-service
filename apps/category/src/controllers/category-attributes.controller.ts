import { Body, Controller, Delete, Param, Put } from '@nestjs/common';
import { CategoryService } from '../services/category.service';
import { AssignAttributesDto } from '../types/assign-attributes.dto';
import { AttributeModel } from '../../../attribute/src/model/attribute.model';

@Controller('categories/:id/attributes')
export class CategoryAttributesController {
  constructor(private readonly categoryService: CategoryService) {}

  @Put()
  async assignOptionsToCategory(
    @Param('id') categoryId: bigint,
    @Body() assignInputs: AssignAttributesDto,
  ) {
    const category = await this.categoryService.getById(categoryId);
    category.assignedAttributes?.push(
      ...assignInputs.attributes.map(
        (partialAttr) => new AttributeModel(partialAttr),
      ),
    );
    return this.categoryService.save(category);
  }

  @Delete(':attributeId')
  async remove(@Param('id') id: bigint, @Param('attributeId') attId: bigint) {
    const entity = await this.categoryService.getById(id);
    (entity.assignedAttributes || []).filter(
      (associate) => associate.uuid === attId,
    );
    return await this.categoryService.save(entity);
  }
}
