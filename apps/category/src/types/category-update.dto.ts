import { CategoryCreationDto } from './category-creation.dto';
import { PartialType } from '@nestjs/swagger';

export class CategoryUpdateDto extends PartialType(CategoryCreationDto) {}
