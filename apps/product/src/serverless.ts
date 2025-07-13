import { NestFactory } from '@nestjs/core';
import { Callback, Context, Handler } from 'aws-lambda';
import { configure } from '@codegenie/serverless-express';
import { NestExpressApplication } from '@nestjs/platform-express';
import { setupApiVersioning } from '@common/common/bootstrap';
import { ProductModule } from './product.module';

let server: Handler;

async function bootstrap(): Promise<Handler> {
  const app: NestExpressApplication = await NestFactory.create(ProductModule);

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
  context.callbackWaitsForEmptyEventLoop = false;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return server(event, context, callback);
};
