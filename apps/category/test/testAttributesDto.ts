import { AttributeDataTypeEnum } from '../../attribute/src/types/attribute-data-type.enum';
import { AttributeOptionModel } from '../../attribute/src/model/attribute-option.model';

export const testAttributesDto = [
  {
    // Global Links
    name: 'entity_code',
    code: 'e2e_entity_code',
    dataType: AttributeDataTypeEnum.SHORT_TEXT,
    status: true,
  },
  {
    // Direct Web Links
    name: 'slug',
    code: 'e2e_slug',
    dataType: AttributeDataTypeEnum.URL,
    status: true,
  },
  {
    // Direct to Blogs
    name: 'Title',
    code: 'e2e_page_title',
    dataType: AttributeDataTypeEnum.SHORT_TEXT,
    status: true,
  },
  {
    // Direct to Blog
    name: 'keywords',
    code: 'e2e_page_keywords',
    dataType: AttributeDataTypeEnum.SHORT_TEXT,
    status: true,
  },
  {
    // Direct to Blog
    name: 'Description',
    code: 'e2e_page_description',
    dataType: AttributeDataTypeEnum.LONG_TEXT,
    status: true,
  },
  {
    // Direct to Blog/Tech
    name: 'Tech Area',
    code: 'e2e_page_tech_area',
    dataType: AttributeDataTypeEnum.DROPDOWN,
    status: true,
    options: [
      AttributeOptionModel.create<AttributeOptionModel>({
        optionValueData: 'Distributed Systems',
      }),
      AttributeOptionModel.create<AttributeOptionModel>({
        optionValueData: 'Reverse Engineering',
      }),
      AttributeOptionModel.create<AttributeOptionModel>({
        optionValueData: 'Phishing & Scam',
      }),
    ],
  },
  {
    // not assigned
    name: 'Tags',
    code: 'e2e_page_tags',
    dataType: AttributeDataTypeEnum.MULTISELECT,
    status: false,
  },
];
