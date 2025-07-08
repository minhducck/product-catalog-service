import { Test, TestingModule } from '@nestjs/testing';
import { MysqlDatabaseService } from './mysql-database.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import DatabaseConfig from '@database/mysql-database/config/database.config';
import { CommonModule } from '@common/common';

describe('MysqlDatabaseService', () => {
  let service: MysqlDatabaseService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        CommonModule,
        TypeOrmModule.forRootAsync({ useClass: DatabaseConfig }),
      ],
      providers: [MysqlDatabaseService],
    }).compile();

    service = module.get<MysqlDatabaseService>(MysqlDatabaseService);
  });

  afterAll(async () => {
    await module.close();
    console.log('Module Close Done');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service.healthCheck()).toBeTruthy();
  });
});
