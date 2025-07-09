import { AttributeModel } from '../../../attribute/src/model/attribute.model';
import { ApiProperty, ApiSchema } from '@nestjs/swagger/dist/decorators';
import { IsInstance, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

@ApiSchema({
  name: 'AssignAttribute',
  description: 'Assign Attribute Entry',
})
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
  @Type(() => AssignAttribute)
  attributes: AssignAttribute[];
}
