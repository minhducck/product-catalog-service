import { Test, TestingModule } from '@nestjs/testing';
import { MysqlDatabaseService } from './mysql-database.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import DatabaseConfig from '@database/mysql-database/config/database.config';
import { CommonModule } from '@common/common';

describe('MysqlDatabaseService', () => {
  let service: MysqlDatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CommonModule,
        TypeOrmModule.forRootAsync({ useClass: DatabaseConfig }),
      ],
      providers: [MysqlDatabaseService],
    }).compile();

    service = module.get<MysqlDatabaseService>(MysqlDatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service.healthCheck()).toBeTruthy();
  });
});
