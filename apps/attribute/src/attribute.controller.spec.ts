import { Test, TestingModule } from '@nestjs/testing';
import { AttributeController } from './attribute.controller';
import { AttributeService } from './attribute.service';

describe('AttributeController', () => {
  let attributeController: AttributeController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AttributeController],
      providers: [AttributeService],
    }).compile();

    attributeController = app.get<AttributeController>(AttributeController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(attributeController.getHello()).toBe('Hello World!');
    });
  });
});
