import { AttributeModel } from '../../../attribute/src/model/attribute.model';
import { ApiProperty } from '@nestjs/swagger/dist/decorators';
import { IsInstance, IsOptional, IsString } from 'class-validator';

export class AssignAttribute implements Partial<AttributeModel> {
  @ApiProperty({ type: 'string', description: 'Attribute uuid' })
  @IsString()
  @IsOptional()
  uuid?: bigint;

  @ApiProperty({ type: 'string', description: 'Attribute uuid' })
  @IsString()
  @IsOptional()
  code?: string;
}
export class AssignAttributesDto {
  @ApiProperty({
    type: [AssignAttribute],
    uniqueItems: true,
  })
  @IsInstance(AssignAttribute, { each: true })
  attributes: AssignAttribute[];
}
