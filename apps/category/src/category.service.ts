import { Inject, Injectable } from '@nestjs/common';
import { BaseService } from '@database/mysql-database/service/base.service';
import { CategoryModel } from './model/category.model';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class CategoryService extends BaseService<CategoryModel> {
  constructor(
    @InjectRepository(CategoryModel)
    protected readonly repo: Repository<CategoryModel>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    @Inject(EventEmitter2) protected readonly eventEmitter: EventEmitter2,
  ) {
    const idFieldName = 'uuid';
    const eventPrefix = 'category-service';
    super(repo, dataSource, eventEmitter, idFieldName, eventPrefix);
  }
}
