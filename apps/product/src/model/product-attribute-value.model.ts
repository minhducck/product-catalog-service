import { BaseModel } from '@database/mysql-database/model/base.model';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ProductModel } from './product.model';
import { AttributeModel } from '../../../attribute/src/model/attribute.model';
import { ProductAttributeValueClass } from '../types/product-attribute-value.class';
import { ApiProperty } from '@nestjs/swagger/dist/decorators';

@Entity({
  name: 'product_attribute_value',
  comment: 'Product Attribute Value',
})
export class ProductAttributeValueModel extends BaseModel<ProductAttributeValueModel> {
  @ManyToOne(() => ProductModel, {
    lazy: true,
    cascade: true,
    onDelete: 'CASCADE',
    createForeignKeyConstraints: true,
  })
  @JoinColumn({ name: 'productId' })
  product: ProductModel;

  @ManyToOne(() => AttributeModel, {
    lazy: true,
    cascade: true,
    onDelete: 'CASCADE',
    createForeignKeyConstraints: true,
    persistence: true,
  })
  @JoinColumn({ name: 'attributeId' })
  attribute: AttributeModel;

  @ApiProperty({ description: 'Product Attribute Value' })
  @Column({ type: 'json', nullable: true })
  value: ProductAttributeValueClass;
}
