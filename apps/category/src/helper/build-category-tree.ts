import { CategoryTreeType, TreeNode } from '../types/category-tree.type';
import { CategoryModel } from '../model/category.model';

export function buildCategoryTree(
  categories: TreeNode[],
  fromNode: CategoryModel | null = null,
): CategoryTreeType {
  const tree: CategoryTreeType = [];
  let fromNodeResult: TreeNode | null = null;

  for (const category of categories) {
    category.children = categories.filter(
      (cat) => cat.parentCategory === category.uuid,
    );

    // Link Parents
    category.children.forEach((child) => {
      child.parentCategory = category;
    });

    if (fromNode?.uuid === category.uuid) {
      fromNodeResult = category;
    }

    if (!category.parentCategory) {
      tree.push(category);
    }
  }

  return fromNodeResult ? [fromNodeResult] : tree;
}
