import { NestFactory } from '@nestjs/core';
import { AttributeModule } from './attribute.module';

async function bootstrap() {
  const app = await NestFactory.create(AttributeModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
