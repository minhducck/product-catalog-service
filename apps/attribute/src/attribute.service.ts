import { Inject, Injectable } from '@nestjs/common';
import { BaseService } from '@database/mysql-database/service/base.service';
import { AttributeModel } from './model/attribute.model';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AttributeService extends BaseService<AttributeModel> {
  constructor(
    @InjectRepository(AttributeModel)
    protected readonly repo: Repository<AttributeModel>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    @Inject(EventEmitter2) protected readonly eventEmitter: EventEmitter2,
    protected readonly idFieldName = 'uuid',
    protected readonly eventPrefix = 'attribute-service',
  ) {
    super(repo, dataSource, eventEmitter, idFieldName, eventPrefix);
  }
}
