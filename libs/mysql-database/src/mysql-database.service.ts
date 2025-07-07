import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm/dist/common/typeorm.decorators';

@Injectable()
export class MysqlDatabaseService {
  @InjectDataSource() private readonly dataSource: DataSource;

  async healthCheck(): Promise<boolean> {
    return this.dataSource
      .query('SELECT "ALIVE"')
      .then((value) => value === 'ALIVE');
  }
}
