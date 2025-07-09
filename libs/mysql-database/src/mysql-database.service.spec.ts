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
  }, 10000);

  it('should be defined', async () => {
    expect(service).toBeDefined();
    const isHealthy = await service.healthCheck();
    expect(isHealthy).toBeTruthy();
    expect(isHealthy).toMatchObject([{ PING: 'PONG' }]);
  });
});
