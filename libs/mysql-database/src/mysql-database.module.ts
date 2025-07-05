import { Module } from '@nestjs/common';
import { MysqlDatabaseService } from './mysql-database.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import DatabaseConfig from '@database/mysql-database/config/database.config';

@Module({
  imports: [TypeOrmModule.forRootAsync({ useClass: DatabaseConfig })],
  providers: [MysqlDatabaseService],
  exports: [MysqlDatabaseService, TypeOrmModule],
})
export class MysqlDatabaseModule {}
