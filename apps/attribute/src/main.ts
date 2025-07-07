import { NestFactory } from '@nestjs/core';
import { AttributeModule } from './attribute.module';
import { setupApiVersioning } from '@common/common/bootstrap';

async function bootstrap() {
  const app = await NestFactory.create(AttributeModule);
  setupApiVersioning(app);
  await app.listen(process.env.port ?? 3000);
}
void bootstrap();
