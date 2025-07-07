import { AttributeOptionModel } from '../model/attribute-option.model';
import { ApiProperty } from '@nestjs/swagger/dist/decorators';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AttributeOptionCreationDto
  implements Partial<AttributeOptionModel>
{
  @ApiProperty({ type: 'string' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  optionValueData: string;
}
