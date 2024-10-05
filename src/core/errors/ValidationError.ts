import { AppBaseError } from './AppBaseError';

import { ErrorTypes } from '~/core/dictionary/error.types';

export class ValidationError extends AppBaseError {
  constructor(message: string) {
    super({
      type: ErrorTypes.Validation,
      statusCode: 400,
      message,
    });
  }
}
