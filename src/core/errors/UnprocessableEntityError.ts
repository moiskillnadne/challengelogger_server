import { AppBaseError } from './AppBaseError';
import { ErrorTypes } from '../dictionary/error.types';

export class UnprocessableEntityError extends AppBaseError {
  constructor(message: string) {
    super({
      type: ErrorTypes.UnprocessableEntity,
      statusCode: 422,
      message,
    });
  }
}
