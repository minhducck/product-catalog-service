import { ValidationPipe } from '@nestjs/common';

export function setupObjectValidation(app) {
  // Object validation
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
}
