import { OnEvent } from '@nestjs/event-emitter';
import { CategoryModel } from '../model/category.model';
import { CategoryService } from '../services/category.service';
import { Injectable, Logger } from '@nestjs/common';
import { buildCategoryTree } from '../helper/build-category-tree';

@Injectable()
export class IndexCategoryTreeListener {
  private readonly logger = new Logger(this.constructor.name);
  private sharedLock = false;
  constructor(private readonly categoryService: CategoryService) {}
  @OnEvent('category-service.save.commit.after')
  async execute() {
    if (this.sharedLock) return;

    await this.wrapInToLockWrapper(async () => {
      this.logger.log('Reindex category tree');
      this.sharedLock = true;

      const catNodes = await this.categoryService.getList({
        select: { parentCategory: true, assignedAttributes: true },
        loadRelationIds: {
          relations: ['parentCategory'],
        },
      });
      const tree = buildCategoryTree(catNodes);
      const ROOT = CategoryModel.create<CategoryModel>({ children: tree });
      let shareCounter = 0;

      const indexTree = (treeNode: CategoryModel, level = 1) => {
        if (!treeNode) return;

        treeNode.level = level;
        treeNode.left = shareCounter++;

        for (const child of treeNode.children) {
          indexTree(child, level + 1);
        }
        treeNode.right = shareCounter++;
      };

      indexTree(ROOT);
      await this.categoryService.saveBulk(catNodes);
      this.logger.log('Reindex category tree done');
    });
  }

  async wrapInToLockWrapper(fn: () => Promise<void>) {
    this.sharedLock = true;
    return fn().finally(() => {
      this.sharedLock = false;
    });
  }
}
