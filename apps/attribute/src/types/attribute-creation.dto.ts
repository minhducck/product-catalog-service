import { AttributeModel } from '../model/attribute.model';
import { ApiProperty } from '@nestjs/swagger/dist/decorators';
import { AttributeDataTypeEnum } from './attribute-data-type.enum';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class AttributeCreationDto implements Partial<AttributeModel> {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @ApiProperty({ description: 'Attribute Code', required: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @Matches(/^[a-z-]+$/)
  code: string;

  @ApiProperty({ required: true, enum: AttributeDataTypeEnum })
  @IsNotEmpty()
  @IsEnum(AttributeDataTypeEnum)
  dataType: AttributeDataTypeEnum;

  @ApiProperty({ required: false, default: false, type: 'boolean' })
  @IsBoolean()
  @IsOptional()
  isGlobal: boolean = false;

  @ApiProperty({ required: false, type: 'boolean' })
  @IsBoolean()
  @IsOptional()
  isInheritedAllowed: boolean = true;

  @ApiProperty({ required: false, default: false, type: 'boolean' })
  @IsBoolean()
  @IsOptional()
  isMultiSelect: boolean = false;
}
