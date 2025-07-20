import { OnEvent } from '@nestjs/event-emitter';
import { CategoryModel } from '../model/category.model';
import { isEqual } from 'lodash';
import { CategoryAttributeIndexService } from '../../../category-attribute-index/src/services/category-attribute-index.service';
import { AttributeService } from '../../../attribute/src/services/attribute.service';
import { CategoryService } from '../services/category.service';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { wrapTimeMeasure } from '@common/common/helper/wrap-time-measure';
import { AttributeModel } from '../../../attribute/src/model/attribute.model';
import { TreeNode } from '../types/category-tree.type';

@Injectable()
export class IndexAttributeOptionLinkageListener {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @Inject(CategoryAttributeIndexService)
    private readonly catalogAttributeService: CategoryAttributeIndexService,
    private readonly categoryService: CategoryService,
    private readonly attributeService: AttributeService,
  ) {}

  @OnEvent('category-service.save.commit.after')
  async execute({
    entity,
    entityBeforeSave,
  }: {
    entity: CategoryModel;
    entityBeforeSave: CategoryModel;
  }) {
    this.logger.log('Reindex attribute option linkage');
    if (this.shouldReindexAttributeOptionLinkage(entity, entityBeforeSave)) {
      await wrapTimeMeasure(
        async () =>
          this.catalogAttributeService.indexCategoryAttributes(
            (await this.categoryService.getList({
              relations: ['parentCategory', 'assignedAttributes'],
              loadRelationIds: {
                relations: ['parentCategory'],
              },
            })) as TreeNode[],
            await this.attributeService.getList(),
          ),
        'Reindex attribute option linkage',
        this.logger,
      );
    }
    this.logger.log('Reindex attribute option linkage done');
  }

  private shouldReindexAttributeOptionLinkage(
    entity: CategoryModel,
    entityBeforeSave: CategoryModel,
  ) {
    const keyToChecks: (keyof CategoryModel)[] = ['children', 'parentCategory'];

    if (
      this.isSameElms(
        entity?.assignedAttributes,
        entityBeforeSave?.assignedAttributes,
      )
    ) {
      return true;
    }
    return keyToChecks.some(
      (key) => !isEqual(entity?.[key], entityBeforeSave?.[key]),
    );
  }

  private isSameElms(
    assignedAttributes: AttributeModel[] = [],
    assignedAttributes2: AttributeModel[] = [],
  ) {
    return isEqual(
      assignedAttributes.map((attr) => attr.uuid),
      assignedAttributes2.map((attr) => attr.uuid),
    );
  }
}
