import { Injectable } from '@nestjs/common';
import { EntityModel } from './model/entity.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class EntityService {
  @InjectRepository(EntityModel)
  private readonly entityRepository: Repository<EntityModel>;

  getHello(): string {
    return 'Hello World!';
  }

  createEntity(entity: EntityModel) {
    return this.entityRepository.save(entity);
  }
}
