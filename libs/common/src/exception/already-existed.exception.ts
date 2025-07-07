import { ConflictException } from '@nestjs/common';

export class AlreadyExistedException extends ConflictException {
  message: 'Entity already exists';
}
