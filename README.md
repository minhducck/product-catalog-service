# Catalog Management System

## Assumption
- Let's say all the HTTP/HTTPs requests and security matter was processed on API Gateway and from here only receiving the execution request. Also Idempotent was processed from API Gateway layer.
- Attribute name will be unique.
- For attribute type as URL, Images, MultiSelect value will be store as **String Type**.

## Tech Stack
> - Node Version **v22.14**
> - Serverless Framework **v4.17**
> - NestJS **v11.0**
> - Database: **Mysql8**

## References docs
> - https://docs.nestjs.com/faq/serverless
> - https://docs.nestjs.com/cli/monorepo#monorepo-mode

## Roadmaps
- [ ] Product entities
- [ ] Support for image type / Allow user to upload images.
- [ ] Move the database creation to migrations instead of using `synchronize` mode.
- [ ] Support partial Category/Attribute linkage indexation for increasing performance. 

## Database Schemas
> https://drawsql.app/teams/free-79/diagrams/catalog

## Environments
### Standalone
> BaseUrl: https://catalog.duckonemorec.me/
> Swagger Docs: https://catalog.duckonemorec.me/swagger

### AWS Lambda
> BaseUrl: https://jn4lapp0gk.execute-api.ap-southeast-1.amazonaws.com/test/


## Installation
```bash
    # Install Serverless
    npm i -g serverless@4.17.1
    
    # Install source code deps
    npm install
    # [*] Must configure `.env` following structure from `.env.sample`
    # Start API server
    ENV=dev npm start:dev
```

## How tos
### How to construct _Sorting_ query

### How to construct _Pagination_ queryk

## Supported APIs
The detailed API docs available on: https://catalog.duckonemorec.me/swagger



### Attributes
#### Create Attributes
```http request
POST /V1/attributes
Content-Type: application/json

{
    "name": "{{attributeName}}",
    "code": "{{attributeCode}}",
    "dataType": "{{attributeDataType}}"
}
```

#### Get list attributes
```http request
GET /V1/attributes
```

#### Get list attributes with associated attributes
```http request
GET /V1/attributes?categoryIds={categoryId}&categoryIds={categoryIds}
```

#### Get list attributes not associated to any categories
```http request
GET /V1/attributes?categoryIds={categoryId}&categoryIds={categoryIds}&filterNonAssigned=true
```

#### Get list attributes by search keyword
```http request
GET /V1/attributes?categoryIds={categoryId}&categoryIds={categoryIds}&keyword=Glob
```


#### Get list attributes by link types
```http request
GET /V1/attributes?categoryIds={categoryId}&categoryIds={categoryIds}&linkTypes=Inherited&linkTypes=Direct
```

## Categories
### Create category
Request:
```http request
POST /V1/categories
Content-Type: application/json

{
      "name": "{{CategoryName}}",
      "parentCategory": "{{categoryUUID}}"
}
```

### Assign attribute to category
Request:
```http request
PUT /V1/categories/{categoryId}/attributes
Content-Type: application/json

{
    "attributes": [{"uuid": "{{attributeUUID}}"}]
}
```

### View Category Tree
Request:
```http request
GET /V1/categories
```
