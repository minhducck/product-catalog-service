import { CategoryModel } from '../model/category.model';
import { ApiProperty } from '@nestjs/swagger/dist/decorators';
import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CategoryCreationDto implements Partial<CategoryModel> {
  @ApiProperty({ type: 'string', description: 'Category name' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Parent Category Id',
    type: 'string',
    nullable: true,
  })
  @IsNumberString()
  @IsOptional()
  parentCategory: bigint;
}
