import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { CategoryService } from '../services/category.service';
import { CategoryModel } from '../model/category.model';
import {
  SearchQueryResponseInterceptor,
  SearchQueryResult,
} from '@database/mysql-database/interceptor/search-query-response-interceptor.service';
import { CategoryTreeType } from '../types/category-tree.type';
import { buildCategoryTree } from '../helper/build-category-tree';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CategoryTreeResponse } from '../types/category-tree-response';
import { CategoryCreationDto } from '../types/category-creation.dto';
import { NoSuchEntityException } from '@common/common/exception/no-such-entity.exception';
import { CategoryUpdateDto } from '../types/category-update.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({
    description: 'Create new category',
    summary: 'Create category',
  })
  async create(@Body() categoryDto: CategoryCreationDto) {
    if (
      categoryDto.parentCategory &&
      !(await this.categoryService.isExistId(categoryDto.parentCategory))
    ) {
      throw new NoSuchEntityException('Parent category does not exists.');
    }
    const categoryModel = CategoryModel.create<CategoryModel>(categoryDto);

    return this.categoryService.save(categoryModel);
  }

  @Get()
  @ApiOperation({
    description: 'Get the list of all categories as tree structure',
    summary: 'Get category tree',
  })
  @UseInterceptors(SearchQueryResponseInterceptor)
  @ApiResponse({ status: 200, type: CategoryTreeResponse })
  async getList(): Promise<SearchQueryResult<CategoryTreeType>> {
    const [categoryList, totalCategory] =
      await this.categoryService.getListAndCount({
        where: {},
        select: { parentCategory: true, linkedProducts: false },
        relations: ['parentCategory', 'assignedAttributes', 'attributeLinks'],
        relationLoadStrategy: 'join',
        loadEagerRelations: false,
        loadRelationIds: { relations: ['parentCategory'] },
      });

    return [buildCategoryTree(categoryList), totalCategory];
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: CategoryModel,
  })
  @ApiOperation({
    description: 'Get category by id',
    summary: 'Get category',
  })
  getCategory(@Param('id') id: bigint) {
    return this.categoryService.getById(id);
  }

  @Put(':id')
  @ApiOperation({
    description: 'Update Category',
    summary: 'Update the category',
  })
  update(@Param('id') id: bigint, @Body() categoryDto: CategoryUpdateDto) {
    return this.categoryService.update(id, categoryDto);
  }

  @Delete(':id')
  @ApiOperation({
    description: 'Delete Category',
    summary: 'Delete specified category',
  })
  async remove(@Param('id') id: bigint) {
    const entity = await this.categoryService.getById(id);
    return await this.categoryService.delete(entity);
  }
}
