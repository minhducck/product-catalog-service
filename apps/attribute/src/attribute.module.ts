import { Module } from '@nestjs/common';
import { AttributeController } from './controllers/attribute.controller';
import { AttributeService } from './services/attribute.service';
import { CommonModule } from '@common/common';
import { MysqlDatabaseModule } from '@database/mysql-database';
import { AttributeModel } from './model/attribute.model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttributeOptionModel } from './model/attribute-option.model';
import { AttributeOptionService } from './services/attribute-option.service';

@Module({
  imports: [
    CommonModule,
    MysqlDatabaseModule,
    TypeOrmModule.forFeature([AttributeModel, AttributeOptionModel]),
  ],
  controllers: [AttributeController],
  providers: [AttributeService, AttributeOptionService],
  exports: [AttributeService, AttributeOptionService],
})
export class AttributeModule {}
