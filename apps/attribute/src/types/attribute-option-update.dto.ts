import { PartialType } from '@nestjs/swagger';
import { AttributeOptionCreationDto } from '@app/attribute/types/attribute-option-creation.dto';

export class AttributeOptionUpdateDto extends PartialType(
  AttributeOptionCreationDto,
) {}
