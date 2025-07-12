import { CategoryModel } from '../src/model/category.model';
import { AttributeModel } from '../../attribute/src/model/attribute.model';
import { CategoryService } from '../src/services/category.service';

export const testAttributesDtoSpec = async (
  categoryService: CategoryService,
  testAttributeEntities: AttributeModel[],
) => {
  const categoryEntities: CategoryModel[] = [];
  const web = await categoryService.save(
    CategoryModel.create<CategoryModel>({
      name: 'Web',
      assignedAttributes: testAttributeEntities.filter(
        ({ code }) => 'e2e_slug' == code,
      ),
    }),
  );

  // Setup test Category
  // Root > Web > Blog > Tech
  // Root > Web > Blog > Random

  const blog = await categoryService.save(
    CategoryModel.create<CategoryModel>({
      name: 'Blog',
      assignedAttributes: testAttributeEntities.filter(({ code }) =>
        [
          'e2e_page_title',
          'e2e_page_keywords',
          'e2e_page_description',
        ].includes(code),
      ),
      parentCategory: web,
    }),
  );

  const tech = await categoryService.save(
    CategoryModel.create<CategoryModel>({
      name: 'Tech',
      assignedAttributes: testAttributeEntities.filter(
        ({ code }) => 'e2e_page_tech_area' == code,
      ),
      parentCategory: blog,
    }),
  );
  const random = await categoryService.save(
    CategoryModel.create<CategoryModel>({
      name: 'Random',
      assignedAttributes: testAttributeEntities.filter(
        ({ code }) => 'e2e_slug' == code,
      ),
      parentCategory: blog,
    }),
  );
  categoryEntities.push(web, blog, tech, random);
  return categoryEntities;
};
