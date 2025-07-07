import { Inject, Injectable } from '@nestjs/common';
import { BaseService } from '@database/mysql-database/service/base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AttributeOptionModel } from '../model/attribute-option.model';

@Injectable()
export class AttributeOptionService extends BaseService<AttributeOptionModel> {
  constructor(
    @InjectRepository(AttributeOptionModel)
    protected readonly repo: Repository<AttributeOptionModel>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    @Inject(EventEmitter2) protected readonly eventEmitter: EventEmitter2,
  ) {
    const idFieldName = 'uuid';
    const eventPrefix = 'attribute-option-service';
    super(repo, dataSource, eventEmitter, idFieldName, eventPrefix);
  }
}
