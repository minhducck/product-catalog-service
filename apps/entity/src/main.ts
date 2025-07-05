import { NestFactory } from '@nestjs/core';

import { Callback, Context, Handler } from 'aws-lambda';
import { initApiResponse } from '@common/common/helper/initApiResponse';
import { EntityService } from './entity.service';
import { EntityModule } from './entity.module';
import {
  setupApiVersioning,
  setupObjectValidation,
} from '@common/common/bootstrap';

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  const appContext = await NestFactory.create(EntityModule);
  const service = appContext.get(EntityService);

  setupApiVersioning(appContext);
  setupObjectValidation(appContext);

  const result = await initApiResponse(service.getHello());

  if (result.error) {
    callback(result);
  } else {
    callback(null, result);
  }
  return;
};
