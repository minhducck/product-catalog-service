import { ConfigService } from '@nestjs/config';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { writeFileSync } from 'fs';

export function setupSwagger(app: INestApplication) {
  const configService: ConfigService = app.get(ConfigService);
  const appVersion: string = configService.get('APP_VERSION', 'V1');

  const config = new DocumentBuilder()
    .setTitle(
      `${configService.get('APPLICATION_NAME')}
      - API Documentation
      - ${appVersion}`,
    )
    .setVersion(appVersion)
    .setTermsOfService(
      `Internal API uses only - Any external users are prohibited.`,
    )
    .build();

  const options: SwaggerDocumentOptions = {
    operationIdFactory: (
      controllerKey: string,
      methodKey: string,
      version: string,
    ) => `${controllerKey} - ${methodKey} - ${version}`,
    autoTagControllers: true,
    ignoreGlobalPrefix: false,
    deepScanRoutes: true,
  };

  const document = SwaggerModule.createDocument(app, config, options);
  writeFileSync('./var/swagger-spec.json', JSON.stringify(document), {
    mode: '0740',
    flag: 'w+',
  });

  SwaggerModule.setup(
    'swagger',
    app,
    SwaggerModule.createDocument(app, config, options),
  );
}
