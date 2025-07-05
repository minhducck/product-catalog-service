import { INestApplication, VersioningType } from '@nestjs/common';

export function setupApiVersioning(app: INestApplication) {
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'V',
    defaultVersion: '1',
  });
}
