import { NestFactory } from '@nestjs/core';
import { CategoryAttributeIndexModule } from './category-attribute-index.module';

async function bootstrap() {
  const app = await NestFactory.create(CategoryAttributeIndexModule);
  await app.listen(process.env.port ?? 3000);
}
void bootstrap();
