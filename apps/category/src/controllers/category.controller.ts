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
import { ApiResponse } from '@nestjs/swagger';
import { CategoryTreeResponse } from '../types/category-tree-response';
import { CategoryCreationDto } from '../types/category-creation.dto';
import { NoSuchEntityException } from '@common/common/exception/no-such-entity.exception';
import { CategoryUpdateDto } from '../types/category-update.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
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
  @UseInterceptors(SearchQueryResponseInterceptor)
  @ApiResponse({ status: 200, type: CategoryTreeResponse })
  async getList(): Promise<SearchQueryResult<CategoryTreeType>> {
    const [categoryList, totalCategory] =
      await this.categoryService.getListAndCount({
        where: {},
        select: { parentCategory: true, linkedProducts: true },
        relations: ['parentCategory'],
        relationLoadStrategy: 'join',
        loadEagerRelations: false,
        loadRelationIds: true,
      });

    return [buildCategoryTree(categoryList), totalCategory];
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: CategoryModel,
  })
  getCategory(@Param('id') id: bigint) {
    return this.categoryService.getById(id);
  }

  @Put(':id')
  update(@Param('id') id: bigint, @Body() categoryDto: CategoryUpdateDto) {
    return this.categoryService.update(id, categoryDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: bigint) {
    const entity = await this.categoryService.getById(id);
    return await this.categoryService.delete(entity);
  }
}
