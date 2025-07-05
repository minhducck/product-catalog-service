import { NestFactory } from '@nestjs/core';
import { Callback, Context, Handler } from 'aws-lambda';
import { CategoryModule } from './category.module';
import { configure } from '@codegenie/serverless-express';
import { NestExpressApplication } from '@nestjs/platform-express';
import {
  setupApiVersioning,
  setupObjectValidation,
  setupSwagger,
} from '@common/common/bootstrap';

let server: Handler;

async function bootstrap(): Promise<Handler> {
  const app: NestExpressApplication = await NestFactory.create(CategoryModule);

  setupSwagger(app);
  setupObjectValidation(app);
  setupApiVersioning(app);
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();

  return configure({ app: expressApp });
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  server = server ?? (await bootstrap());
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return server(event, context, callback);
};
