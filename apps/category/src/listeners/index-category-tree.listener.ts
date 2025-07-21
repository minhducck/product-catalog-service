import { OnEvent } from '@nestjs/event-emitter';
import { CategoryService } from '../services/category.service';
import { Injectable, Logger } from '@nestjs/common';
import { buildCategoryTree } from '../helper/build-category-tree';
import { TreeNode } from '../types/category-tree.type';
import { wrapTimeMeasure } from '@common/common/helper/wrap-time-measure';

@Injectable()
export class IndexCategoryTreeListener {
  private readonly logger = new Logger(this.constructor.name);
  private sharedLock = false;
  constructor(private readonly categoryService: CategoryService) {}
  @OnEvent('category-service.save.commit.after')
  async execute() {
    return wrapTimeMeasure(
      async () => this.doIndex(),
      'Reindex category tree',
      this.logger,
    );
  }
  async doIndex() {
    if (this.sharedLock) return;

    await this.wrapInToLockWrapper(async () => {
      this.logger.log('Reindex category tree');
      this.sharedLock = true;

      const catNodes = await this.categoryService.getList({
        select: { parentCategory: true, assignedAttributes: true },
        loadRelationIds: {
          relations: ['parentCategory'],
        },
        order: { uuid: 1 },
      });
      const tree = buildCategoryTree(catNodes as TreeNode[]);
      const root = new TreeNode({ children: tree });
      let shareCounter = 0;

      const indexTree = (treeNode: TreeNode, level = 1) => {
        if (!treeNode) return;

        treeNode.level = level;
        treeNode.left = shareCounter++;

        for (const child of treeNode.children) {
          indexTree(child, level + 1);
        }
        treeNode.right = shareCounter++;
      };

      indexTree(root);
      const hasChanges = catNodes.filter((cat) => cat.hasChanged());
      this.logger.log(`Categories to update: ${hasChanges.length}`);
      return this.categoryService.saveBulk(hasChanges).then(() => {
        this.logger.log('Reindex category tree done');
      });
    });
  }

  async wrapInToLockWrapper(fn: () => Promise<void>) {
    this.sharedLock = true;
    return fn().finally(() => {
      this.sharedLock = false;
    });
  }
}
