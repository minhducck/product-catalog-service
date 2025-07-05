import { Module } from '@nestjs/common';
import { AttributeController } from './attribute.controller';
import { AttributeService } from './attribute.service';
import { CommonModule } from '@common/common';
import { MysqlDatabaseModule } from '@database/mysql-database';
import { AttributeModel } from './model/attribute.model';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    CommonModule,
    MysqlDatabaseModule,
    TypeOrmModule.forFeature([AttributeModel]),
  ],
  controllers: [AttributeController],
  providers: [AttributeService],
})
export class AttributeModule {}
