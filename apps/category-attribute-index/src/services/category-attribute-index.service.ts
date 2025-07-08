import { Inject, Injectable } from '@nestjs/common';
import { CategoryModel } from '../../../category/src/model/category.model';
import { AttributeModel } from '../../../attribute/src/model/attribute.model';
import { buildCategoryTree } from '../../../category/src/helper/build-category-tree';
import { CategoryAttributeIndexModel } from '../model/category-attribute-index.model';
import { BaseService } from '@database/mysql-database/service/base.service';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LinkTypeEnum } from '../types/link-type.enum';

type AssignNodeAttributeFn = (
  node: CategoryModel,
  attributes: AttributeModel[],
) => void;

@Injectable()
export class CategoryAttributeIndexService extends BaseService<CategoryAttributeIndexModel> {
  constructor(
    @InjectRepository(CategoryAttributeIndexModel)
    repo: Repository<CategoryAttributeIndexModel>,
    @InjectDataSource() protected readonly dataSource: DataSource,
    @Inject(EventEmitter2) protected readonly eventEmitter: EventEmitter2,
  ) {
    const idFieldName: keyof CategoryAttributeIndexModel = 'uuid';
    const eventPrefix = 'category-attribute-link-service';
    super(repo, dataSource, eventEmitter, idFieldName, eventPrefix);
  }

  indexCategoryAttributes(
    categoryList: CategoryModel[],
    attributeList: AttributeModel[],
  ) {
    const globalAttributes = new Map<bigint, AttributeModel>(
      attributeList.map((attr) => [attr.uuid, attr]),
    );

    const graph = buildCategoryTree(categoryList);
    const tempRootCategory = new CategoryModel({ children: graph });
    const inheritedAttributes: CategoryAttributeIndexModel[] = [];
    const directedAttributes: CategoryAttributeIndexModel[] = [];

    const assignDirectNodes: AssignNodeAttributeFn = (node, attributes) => {
      globalAttributes.delete(node.uuid);
      this.assignNodeFunctionBuilder(directedAttributes, LinkTypeEnum.DIRECT)(
        node,
        attributes,
      );
    };

    const assignInheritedNodes: AssignNodeAttributeFn =
      this.assignNodeFunctionBuilder(
        inheritedAttributes,
        LinkTypeEnum.INHERITED,
      );

    this.treeTraversal(
      tempRootCategory,
      [],
      assignDirectNodes,
      assignInheritedNodes,
    );

    const globalAttributesList = Array.from(globalAttributes.values()).map(
      (attr) =>
        new CategoryAttributeIndexModel({
          attribute: attr,
          category: null,
          linkType: LinkTypeEnum.GLOBAL,
        }),
    );

    this.logger.log('Saving indexed data for direct links to database ...');
    return Promise.all([
      this.saveBulk(directedAttributes),
      this.saveBulk(inheritedAttributes),
      this.saveBulk(globalAttributesList),
    ]);
  }

  treeTraversal(
    treeNode: CategoryModel | null,
    carriedFromParents: AttributeModel[],
    appendDirectOpts: AssignNodeAttributeFn,
    appendInheritedOpts: AssignNodeAttributeFn,
  ) {
    if (!treeNode) {
      return;
    }

    if (treeNode.assignedAttributes) {
      appendDirectOpts(treeNode, treeNode.assignedAttributes);
    }

    const nonDirectedAttributeFromParent = carriedFromParents.filter(
      (att) =>
        !(treeNode.assignedAttributes || []).find(
          (directAttr) => directAttr.uuid === att.uuid,
        ),
    );
    if (nonDirectedAttributeFromParent.length > 0) {
      appendInheritedOpts(treeNode, nonDirectedAttributeFromParent);
    }

    for (const childNode of treeNode.children || []) {
      this.treeTraversal(
        childNode,
        [
          ...nonDirectedAttributeFromParent,
          ...(treeNode.assignedAttributes || []),
        ],
        appendDirectOpts,
        appendInheritedOpts,
      );
    }
  }

  assignNodeFunctionBuilder(
    linkages: CategoryAttributeIndexModel[],
    linkType: LinkTypeEnum,
  ): AssignNodeAttributeFn {
    return (node: CategoryModel, attributes: AttributeModel[] = []) => {
      linkages.push(
        ...attributes.map(
          (attribute) =>
            new CategoryAttributeIndexModel({
              attribute,
              category: node,
              linkType,
            }),
        ),
      );
    };
  }
}
