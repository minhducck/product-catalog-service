import { CategoryModel } from '../model/category.model';
import { AttributeModel } from '../../../attribute/src/model/attribute.model';

export type CategoryTreeType = TreeNode[];

export class TreeNode
  implements Pick<CategoryModel, 'name' | 'uuid' | 'level' | 'left' | 'right'>
{
  level: number;
  assignedAttributes: AttributeModel[];
  constructor({ children = [] }: { children: TreeNode[] }) {
    this.children = children;
  }

  left: number;
  right: number;
  uuid: bigint;
  children: TreeNode[];
  parentCategory: bigint | TreeNode;
  name: string;
}
