import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CommonModule } from '@common/common';
import { MysqlDatabaseModule } from '@database/mysql-database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryController } from './category.controller';
import { AttributeModule } from '../../../attribute/src/attribute.module';
import { CategoryAttributeIndexModule } from '../../../category-attribute-index/src/category-attribute-index.module';
import { CategoryModel } from '../model/category.model';
import { CategoryService } from '../services/category.service';
import { IndexAttributeOptionLinkageListener } from '../listeners/index-attribute-option-linkage.listener';
import { AttributeService } from '../../../attribute/src/services/attribute.service';
import { plainToClass } from 'class-transformer';

describe('CategoryController (e2e)', () => {
  let app: INestApplication;
  let attributeService: AttributeService;
  let categoryService: CategoryService;
  const testEntities: CategoryModel[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        CommonModule,
        MysqlDatabaseModule,
        AttributeModule,
        CategoryAttributeIndexModule,
        TypeOrmModule.forFeature([CategoryModel]),
      ],
      controllers: [CategoryController],
      providers: [CategoryService, IndexAttributeOptionLinkageListener],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    attributeService = app.get(AttributeService);
    categoryService = app.get(CategoryService);
  }, 10000);

  afterAll(async () => {
    await Promise.all(
      testEntities.map(async (entity) =>
        categoryService.delete(plainToClass(CategoryModel, entity)),
      ),
    );
    await app.close();
  }, 10000);

  describe('/categories (POST)', () => {
    it('should create a new category', async () => {
      const createDto = {
        name: 'Test 1',
      };

      const response = await request(app.getHttpServer())
        .post('/categories')
        .send(createDto)
        .expect(201);

      testEntities.push(response.body);
      expect(response.body).toMatchObject({
        name: 'Test 1',
      });
    });

    it('should return a bad request due to missing field', async () => {
      const createDto = {};

      await request(app.getHttpServer())
        .post('/categories')
        .send(createDto)
        .expect(400);
    });
  });

  describe('/categories (GET)', () => {
    beforeAll(async () => {
      const entity = await categoryService.save(
        CategoryModel.create<CategoryModel>({ name: 'TEST FOR GET' }),
      );
      testEntities.push(entity);
    });
    it('should return a list of categories', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      expect(response.body).toHaveProperty('searchResult');
      expect(
        response.body.searchResult.find(
          (e: CategoryModel) => e.name === 'TEST FOR GET',
        ),
      ).toBeTruthy();
      expect(response.body).toHaveProperty('totalCollectionSize');
    });
  });
});
