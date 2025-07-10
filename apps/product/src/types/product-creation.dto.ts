import { PartialType } from '@nestjs/swagger';
import { ProductModel } from '../model/product.model';

export class ProductCreationDto extends PartialType(ProductModel) {}
