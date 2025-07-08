# Catalog Management System

## Assumption
- Let's say all the HTTP/HTTPs requests and security matter was processed on API Gateway and from here only receiving the execution request. Also Idempotent was processed from API Gateway layer.
- Attribute name will be unique.
- For attribute type as URL, Images, MultiSelect value will be store as **String Type**.

## Tech Stack
> - Node Version v22.14
> - Serverless Framework v4.17
> - NestJS v11.0

## References
> - https://docs.nestjs.com/faq/serverless
> - https://docs.nestjs.com/cli/monorepo#monorepo-mode

## Todos
- [ ] Support to handle Add/Delete options.
- [ ] Assigning attribute to Category.
- [ ] Move catalog attribute index to cron or using message queue for async processing.

## Roadmaps
- [ ] Product entities
- [ ] Support for image type / Allow user to upload images.

## Installation
```bash
    # Install Serverless
    npm i -g serverless@4.17.1
```

## Supported APIs
### Attributes
#### [GET] /V1/attributes
> To retrieve the list of Attributes

#### [POST] /V1/attributes
> To create attribute

#### [GET] /V1/attributes/{id}
> To get attribute by Id

#### [PUT] /V1/attributes/{attributeId}
> Update attribute

#### [DELETE] /V1/attributes/{attributeId}
> Delete attributes

### Categories
#### [GET] /V1/categories
> To retrieve the category tree
