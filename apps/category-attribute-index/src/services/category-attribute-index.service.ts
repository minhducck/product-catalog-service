import { Inject, Injectable } from '@nestjs/common';
import { CategoryModel } from '../../../category/src/model/category.model';
import { AttributeModel } from '../../../attribute/src/model/attribute.model';
import { CategoryAttributeIndexModel } from '../model/category-attribute-index.model';
import { BaseService } from '@database/mysql-database/service/base.service';
import { DataSource, In, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LinkTypeEnum } from '../types/link-type.enum';
import { uniq } from 'lodash';
import { TreeNode } from '../../../category/src/types/category-tree.type';
import { buildCategoryTree } from '../../../category/src/helper/build-category-tree';

type AssignNodeAttributeFn = (
  node: TreeNode,
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

  async indexCategoryAttributes(
    categoryList: TreeNode[],
    attributeList: AttributeModel[],
    fromNode: CategoryModel | null = null,
  ) {
    const globalAttributes = attributeList.filter(
      (attr) => attr.associatedCategoryCount == 0 && attr.status,
    );
    const graph = buildCategoryTree(categoryList);
    const tempRootCategory = new TreeNode({ children: graph });
    const initialInheritedAttributes: AttributeModel[] =
      this.getInheritedAttributesFromParent(fromNode);

    const inheritedAttributes: CategoryAttributeIndexModel[] = [];
    const directedAttributes: CategoryAttributeIndexModel[] = [];

    const assignDirectNodes: AssignNodeAttributeFn =
      this.assignNodeFunctionBuilder(directedAttributes, LinkTypeEnum.DIRECT);

    const assignInheritedNodes: AssignNodeAttributeFn =
      this.assignNodeFunctionBuilder(
        inheritedAttributes,
        LinkTypeEnum.INHERITED,
      );

    this.treeTraversal(
      tempRootCategory,
      initialInheritedAttributes,
      assignDirectNodes,
      assignInheritedNodes,
    );
    const globalAttributesList = globalAttributes
      .map((attr) =>
        CategoryAttributeIndexModel.create<CategoryAttributeIndexModel>({
          attribute: attr,
          linkType: LinkTypeEnum.GLOBAL,
        }),
      )
      .flatMap((links) => links);

    this.logger.log('Saving indexed data for direct links to database...');
    this.logger.log('Directed Links: ' + directedAttributes.length);
    this.logger.log('Inherit Links: ' + inheritedAttributes.length);
    this.logger.log('Global Links: ' + globalAttributesList.length);

    //...globalAttributesList
    const deleteLinks = attributeList
      .filter(
        ({ status, associatedCategoryCount }) =>
          status == false || associatedCategoryCount == 0,
      )
      .map(({ uuid }) => uuid);
    const updateLinks = [
      ...directedAttributes,
      ...inheritedAttributes,
      ...globalAttributesList,
    ];

    return this.wrapToTransactionContainer(
      'save_category_attribute_index_data',
      async () => {
        await this.getRepository().delete({
          attribute: { uuid: In(deleteLinks) },
        });
        await this.dataSource.manager.upsert(this.repo.target, updateLinks, [
          'linkType',
        ]);
        this.logger.log('Indexed data saved to database.');
      },
      { deleteLinks, updateLinks },
    );
  }

  treeTraversal(
    treeNode: TreeNode | null,
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
      (att) => !treeNode.assignedAttributes?.includes(att),
    );
    if (nonDirectedAttributeFromParent.length > 0) {
      appendInheritedOpts(treeNode, nonDirectedAttributeFromParent);
    }

    const attributeToPassToChild = uniq([
      ...nonDirectedAttributeFromParent,
      ...(treeNode.assignedAttributes || []),
    ]);

    for (const childNode of treeNode.children || []) {
      this.treeTraversal(
        childNode,
        attributeToPassToChild,
        appendDirectOpts,
        appendInheritedOpts,
      );
    }
  }

  assignNodeFunctionBuilder(
    linkages: CategoryAttributeIndexModel[],
    linkType: LinkTypeEnum,
  ): AssignNodeAttributeFn {
    return (
      node: CategoryModel | TreeNode,
      attributes: AttributeModel[] = [],
    ) => {
      linkages.push(
        ...attributes.map((attribute) =>
          CategoryAttributeIndexModel.create<CategoryAttributeIndexModel>({
            attribute,
            category: node,
            linkType,
          }),
        ),
      );
    };
  }

  private getInheritedAttributesFromParent(fromNode: CategoryModel | null) {
    if (fromNode === null) return [];
    const inheritedFromParent: AttributeModel[] = [];

    // Travel upward.
    let treeNode: CategoryModel = fromNode;
    while (treeNode) {
      inheritedFromParent.push(...(treeNode.assignedAttributes || []));
      treeNode = treeNode.parentCategory as CategoryModel;
    }
    return inheritedFromParent;
  }
}
