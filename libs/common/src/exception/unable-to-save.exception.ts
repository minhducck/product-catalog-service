import { BadRequestException } from '@nestjs/common';

export class UnableToSaveException extends BadRequestException {
  message: 'Unable to save the entity';
}
