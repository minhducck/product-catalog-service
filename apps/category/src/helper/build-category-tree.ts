import { CategoryModel } from '../model/category.model';
import { CategoryTreeType } from '../types/category-tree.type';

export function buildCategoryTree(
  categories: CategoryModel[],
): CategoryTreeType {
  const tree: CategoryTreeType = [];

  for (const category of categories) {
    category.children = categories.filter(
      (cat) => cat.parentCategory === category.uuid,
    );

    if (category.parentCategory === null) {
      tree.push(category);
    }
  }

  return tree;
}
