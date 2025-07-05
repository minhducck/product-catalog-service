import { NotFoundException } from '@nestjs/common';

export class NoSuchEntityException extends NotFoundException {
  message: 'The entity not found.';

  constructor(message = 'Entity not found') {
    super(message);
  }
}
