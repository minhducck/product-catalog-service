import { Inject, Injectable } from '@nestjs/common';
import { BaseService } from '@database/mysql-database/service/base.service';
import { ProductModel } from './model/product.model';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ProductService extends BaseService<ProductModel> {
  constructor(
    @InjectRepository(ProductModel)
    protected readonly repo: Repository<ProductModel>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    @Inject(EventEmitter2) protected readonly eventEmitter: EventEmitter2,
  ) {
    const idFieldName = 'uuid';
    const eventPrefix = 'product-service';
    super(repo, dataSource, eventEmitter, idFieldName, eventPrefix);
  }
}
