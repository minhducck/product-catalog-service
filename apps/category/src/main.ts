import { NestFactory } from '@nestjs/core';
import { CategoryModule } from './category.module';

async function bootstrap() {
  const app = await NestFactory.create(CategoryModule);
  await app.listen(process.env.port ?? 3000);
}
void bootstrap();
