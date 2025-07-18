import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AttributeController } from './attribute.controller';
import { AttributeService } from '../services/attribute.service';
import { AttributeOptionService } from '../services/attribute-option.service';
import { AttributeModel } from '../model/attribute.model';
import { AttributeOptionModel } from '../model/attribute-option.model';
import { CommonModule } from '@common/common';
import { MysqlDatabaseModule } from '@database/mysql-database';
import { TypeOrmModule } from '@nestjs/typeorm';

jest.useRealTimers();

describe('AttributeController (e2e)', () => {
  let app: INestApplication;
  let dataSource: AttributeService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        CommonModule,
        MysqlDatabaseModule,
        TypeOrmModule.forFeature([AttributeModel, AttributeOptionModel]),
      ],
      controllers: [AttributeController],
      providers: [AttributeService, AttributeOptionService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  }, 60000);

  afterAll(async () => {
    dataSource = app.get(AttributeService);

    const entity = await dataSource.getOne({ where: { code: 'test' } }, false);
    if (entity) await dataSource.delete(entity);
    await app.close();
  }, 60000);

  describe('/attributes (POST)', () => {
    it('should create a new attribute', async () => {
      const createDto = {
        isGlobal: false,
        isInheritedAllowed: false,
        isMultiSelect: false,
        code: 'test',
        dataType: 'SHORT_TEXT',
        name: 'Test 1',
      };

      const response = await request(app.getHttpServer())
        .post('/attributes')
        .send(createDto)
        .expect(201);

      expect(response.body).toMatchObject({
        uuid: expect.any(String),
        isGlobal: false,
        isInheritedAllowed: false,
        isMultiSelect: false,
        code: 'test',
        dataType: 'SHORT_TEXT',
        name: 'Test 1',
      });
    });

    it('should return a duplicated records exception', async () => {
      const createDto = {
        isGlobal: false,
        isInheritedAllowed: false,
        isMultiSelect: false,
        code: 'test',
        dataType: 'SHORT_TEXT',
        name: 'Test 1',
      };

      await request(app.getHttpServer())
        .post('/attributes')
        .send(createDto)
        .expect(409);
    });

    it('should return a bad request due to missing field', async () => {
      const createDto = {
        name: 'Test 1',
      };

      await request(app.getHttpServer())
        .post('/attributes')
        .send(createDto)
        .expect(400);
    });
  });

  describe('/attributes (GET)', () => {
    it('should return a list of attributes', async () => {
      const response = await request(app.getHttpServer())
        .get('/attributes')
        .expect(200);

      expect(response.body).toHaveProperty('searchResult');
      expect(response.body).toHaveProperty('totalCollectionSize');
    });
  });

  describe('/attributes (GET) with searchQuery', () => {
    it('should return a list of attributes', async () => {
      const response = await request(app.getHttpServer())
        .get(`/attributes/?keyword=test`)
        .expect(200);

      expect(response.body).toHaveProperty('searchResult');
      expect(response.body).toHaveProperty('totalCollectionSize');

      const testAttr = response.body.searchResult.find(
        (e: AttributeModel) => e.code === 'test',
      );
      expect(testAttr).toMatchObject({ code: 'test' });
    });
  });
});
