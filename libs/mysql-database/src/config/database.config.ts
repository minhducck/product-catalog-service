import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
  TypeOrmOptionsFactory,
} from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import * as path from 'node:path';

export default class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(
    @Inject(ConfigService) protected readonly configService: ConfigService,
  ) {}

  createTypeOrmOptions(): TypeOrmModuleAsyncOptions {
    console.log('Initializing Database Connector');

    const baseSearch = path.resolve(__dirname + '/../../../../../');
    const appEnv: string = this.configService.get('ENV', 'dev');
    const databaseConfig: TypeOrmModuleOptions = {
      type: 'mysql',
      connectorPackage: 'mysql2',
      host: this.configService.get('DBHOST'),
      port: +this.configService.get('DBPORT'),
      username: this.configService.get('DBUSER'),
      password: this.configService.get('DBPASS'),
      database: this.configService.get('DBNAME'),
      migrationsRun: true,
      migrations: [baseSearch + '/**/migration/*.migration{.ts,.js}'],
      migrationsTableName: 'migrations',
      retryAttempts: 5,
      autoLoadEntities: false,
      connectTimeout: 3000,
      timezone: this.configService.get<string>('DB_TIMEZONE', '+08:00'),
      entities: [baseSearch + '/**/model/*.model{.ts,.js}'],
      synchronize: true,
      poolSize: +this.configService.get('DBPOOLSIZE') || 20,
      logging: appEnv === 'production' ? ['error', 'warn', 'migration'] : 'all',
    };

    return databaseConfig;
  }
}
