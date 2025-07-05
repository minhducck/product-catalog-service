import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';

export function setupStaticAssets(app: NestExpressApplication) {
  app.get<ConfigService>(ConfigService);
  app.useStaticAssets(join(__dirname, '..', '..', 'public'));
}
