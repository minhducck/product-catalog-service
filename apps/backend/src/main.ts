import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  setupObjectValidation,
  setupStaticAssets,
  setupSwagger,
} from '@common/common/bootstrap';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  setupSwagger(app);
  setupObjectValidation(app);
  setupStaticAssets(app);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
