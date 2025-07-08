import { OnEvent } from '@nestjs/event-emitter';
import { QueryRunner } from 'typeorm/query-runner/QueryRunner';
import { CategoryModel } from '../model/category.model';
import { isEqual } from 'lodash';
import { CategoryAttributeIndexService } from '../../../category-attribute-index/src/services/category-attribute-index.service';
import { AttributeService } from '../../../attribute/src/services/attribute.service';
import { CategoryService } from '../services/category.service';
import { Logger } from '@nestjs/common';
import { wrapTimeMeasure } from '@common/common/helper/wrap-time-measure';

export class IndexAttributeOptionLinkage {
  private readonly logger = new Logger(this.constructor.name);
  constructor(
    private readonly catalogAttributeService: CategoryAttributeIndexService,
    private readonly categoryService: CategoryService,
    private readonly attributeService: AttributeService,
  ) {}
  @OnEvent('category-service.save.commit.before')
  async execute({
    queryRunner,
    entity,
    entityBeforeSave,
  }: {
    queryRunner: QueryRunner;
    entity: CategoryModel;
    entityBeforeSave: CategoryModel;
  }) {
    if (this.shouldReindexAttributeOptionLinkage(entity, entityBeforeSave)) {
      this.logger.log('Reindex attribute option linkage');
      await wrapTimeMeasure(
        async () =>
          this.catalogAttributeService.indexCategoryAttributes(
            await this.categoryService.getList(),
            await this.attributeService.getList(),
          ),
        'Reindex attribute option linkage',
        this.logger,
      );
      this.logger.log('Reindex attribute option linkage done');
    }
  }

  private shouldReindexAttributeOptionLinkage(
    entity: CategoryModel,
    entityBeforeSave: CategoryModel,
  ) {
    const keyToChecks: (keyof CategoryModel)[] = [
      'children',
      'parentCategory',
      'assignedAttributes',
    ];

    return keyToChecks.some(
      (key) => !isEqual(entity[key], entityBeforeSave[key]),
    );
  }
}
