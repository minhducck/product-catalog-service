import { ConfigService } from '@nestjs/config';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

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
    .setBasePath(`${appVersion}`)
    .build();

  const options: SwaggerDocumentOptions = {
    operationIdFactory: (
      controllerKey: string,
      methodKey: string,
      version: string,
    ) => `${controllerKey} - ${methodKey} - ${version}`,
  };

  SwaggerModule.setup(
    'swagger',
    app,
    SwaggerModule.createDocument(app, config, options),
  );
}
