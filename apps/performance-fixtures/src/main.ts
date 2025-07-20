import { NestFactory } from '@nestjs/core';
import { PerformanceFixturesModule } from './performance-fixtures.module';
import { fakerEN } from '@faker-js/faker';
import { sampleSize } from 'lodash';
import { CategoryService } from '../../category/src/services/category.service';
import { AttributeModel } from '../../attribute/src/model/attribute.model';
import { CategoryModel } from '../../category/src/model/category.model';
import { AttributeOptionModel } from '../../attribute/src/model/attribute-option.model';
import { AttributeDataTypeEnum } from '../../attribute/src/types/attribute-data-type.enum';
import { AttributeService } from '../../attribute/src/services/attribute.service';
import { generateULID } from '@common/common/helper/generate-ulid';
import * as process from 'node:process';

interface IProfile {
  numberOfProducts: number;
  numberOfAttributes: number;
  numberOfCategories: number;

  percentGotOption: number;
  numberOfOptionOnEachAttribute: number;
}

const presetProfile: Record<number, IProfile> = {
  1_000_000: {
    numberOfCategories: 300,
    numberOfAttributes: 500,
    numberOfProducts: 1_000_000,

    percentGotOption: 10,
    numberOfOptionOnEachAttribute: 30,
  },
};

const wrapTimeMeasure = async (action: () => any, task: string) => {
  const [hrTimeStartSec, hrTimeStartNano] = process.hrtime();
  const startTime = hrTimeStartSec * 1000 + hrTimeStartNano / 1000000;

  console.log('task', task);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const rs = await action();

  const [hrEndTimeSec, hrEndTimeNano] = process.hrtime();
  const endTime = hrEndTimeSec * 1000 + hrEndTimeNano / 1000000;

  console.log(`Task: ${task} takes ${endTime - startTime} ms to finish`);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return rs;
};

async function generateCategory(
  n: number,
  categoryService: CategoryService,
  prefix: string = 'L1',
  attributes: AttributeModel[],
  parentList: CategoryModel[] = [],
) {
  const MAX_ATTRIBUTE_FOR_CAT = 5;
  const generateAttrs = () =>
    sampleSize(attributes, (Math.random() * 100) % MAX_ATTRIBUTE_FOR_CAT);

  const categoriesL1 = Array(n)
    .fill(`L1`)
    .map((i, index) =>
      CategoryModel.create<CategoryModel>({
        name: `${prefix} ${fakerEN.commerce.department()}_${index}`,
        parentCategory:
          parentList.length === 0
            ? undefined
            : parentList[
                parseInt(String((Math.random() * 10000) % parentList.length))
              ],
        assignedAttributes: generateAttrs(),
      }),
    );
  return await categoryService.saveBulk(categoriesL1);
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(
    PerformanceFixturesModule,
  ).then((contxt) => contxt.init());
  const profile = presetProfile[1_000_000];

  const attributes = Array<number>(profile.numberOfAttributes)
    .fill(1)
    .map((i, attI) => {
      const isAbleToAddOption = attI % 10 === profile.percentGotOption / 10;
      const attrName = `attribute_${attI}_${generateULID()}`;

      let options: AttributeOptionModel[] = [];

      if (isAbleToAddOption) {
        options = Array<number>(profile.numberOfOptionOnEachAttribute)
          .fill(1)
          .map((i, optI) =>
            AttributeOptionModel.create<AttributeOptionModel>({
              optionValueData: `${attrName}_option_${optI}`,
            }),
          );
      }

      return AttributeModel.create<AttributeModel>({
        code: attrName,
        name: attrName,
        status: true,
        dataType: AttributeDataTypeEnum.SHORT_TEXT,
        options,
      });
    });
  const attributeService = app.get(AttributeService);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const attributeList = await wrapTimeMeasure(async () => {
    return attributeService.saveBulk(attributes);
  }, 'Create Attribute Data');

  // 5% on level 1. 15% L2. rest L3
  const numberAtL1 = parseInt(String((profile.numberOfCategories * 5) / 100));
  const numberAtL2 = parseInt(String((profile.numberOfCategories * 15) / 100));
  const numberAtL3 = profile.numberOfCategories - numberAtL1 - numberAtL2;
  const categoryService = app.get(CategoryService);
  const Cat1 = await generateCategory(
    numberAtL1,
    categoryService,
    'L1',
    attributeList,
  );
  const Cat2 = await generateCategory(
    numberAtL2,
    categoryService,
    'L2',
    attributeList,
    Cat1,
  );
  await generateCategory(
    numberAtL3,
    categoryService,
    'L3',
    attributeList,
    Cat2,
  );
}

bootstrap()
  .then(() => {
    console.log('Process done.');
    process.exit(0);
  })
  .catch(console.error);
