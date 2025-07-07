import { PartialType } from '@nestjs/swagger';
import { AttributeOptionCreationDto } from './attribute-option-creation.dto';

export class AttributeOptionUpdateDto extends PartialType(
  AttributeOptionCreationDto,
) {}
