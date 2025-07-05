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
import { CategoryService } from './category.service';
import { CategoryModel } from './model/category.model';
import {
  SearchQueryResponseInterceptor,
  SearchQueryResult,
} from '@database/mysql-database/interceptor/search-query-response-interceptor.service';
import { CategoryTreeType } from './types/category-tree.type';
import { buildCategoryTree } from './helper/build-category-tree';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CategoryTreeResponse } from './types/category-tree-response';
import { CategoryCreationDto } from './types/category-creation.dto';

@Controller('categories')
@ApiTags('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Body() categoryDto: CategoryCreationDto) {
    const categoryModel = new CategoryModel(categoryDto);
    return this.categoryService.save(categoryModel);
  }

  @Get()
  @UseInterceptors(SearchQueryResponseInterceptor)
  @ApiResponse({ status: 200, type: CategoryTreeResponse })
  async getList(): Promise<SearchQueryResult<CategoryTreeType>> {
    const [categoryList, totalCategory] = await this.categoryService.getList({
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
  getCategory(@Param('id') id: string) {
    return this.categoryService.getById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() categoryDto: CategoryModel) {
    return this.categoryService.update(id, categoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService
      .getById(id)
      .then((entity) => this.categoryService.delete(entity));
  }
}
