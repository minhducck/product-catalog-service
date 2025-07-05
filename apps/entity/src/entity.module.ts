import { Module } from '@nestjs/common';
import { EntityController } from './entity.controller';
import { EntityService } from './entity.service';
import { CommonModule } from '@common/common';
import { MysqlDatabaseModule } from '@database/mysql-database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityModel } from './model/entity.model';

@Module({
  imports: [
    CommonModule,
    MysqlDatabaseModule,
    TypeOrmModule.forFeature([EntityModel]),
  ],
  controllers: [EntityController],
  providers: [EntityService],
})
export class EntityModule {}
