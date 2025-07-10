import { ApiProperty } from '@nestjs/swagger/dist/decorators';

export class ProductAttributeValueClass {
  @ApiProperty({
    type: 'string',
    nullable: true,
    description: 'Value of the linked Products attribute',
  })
  value: string;
}
