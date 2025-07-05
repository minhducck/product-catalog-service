import { Body, Controller, Get, Post } from '@nestjs/common';
import { EntityService } from './entity.service';
import { EntityModel } from './model/entity.model';
import { ApiTags } from '@nestjs/swagger';

@Controller('entities')
@ApiTags('Entities')
export class EntityController {
  constructor(private readonly entityService: EntityService) {}

  @Get()
  getHello(): string {
    return this.entityService.getHello();
  }

  @Post()
  create(@Body() entity: EntityModel) {
    return this.entityService.createEntity(entity);
  }
}
