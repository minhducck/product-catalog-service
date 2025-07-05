import { CategoryCreationDto } from './category-creation.dto';

export class CategoryUpdateDto extends PartialType(CategoryCreationDto) {}
