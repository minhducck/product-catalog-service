import { Test, TestingModule } from '@nestjs/testing';
import { MysqlDatabaseService } from './mysql-database.service';

describe('MysqlDatabaseService', () => {
  let service: MysqlDatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MysqlDatabaseService],
    }).compile();

    service = module.get<MysqlDatabaseService>(MysqlDatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service.healthCheck()).toBeTruthy();
  });
});
