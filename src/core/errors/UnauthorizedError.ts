import { AppBaseError } from './AppBaseError';

import { ErrorTypes } from '~/core/dictionary/error.types';

export class UnauthorizedError extends AppBaseError {
  constructor(message: string) {
    super({
      type: ErrorTypes.validation,
      statusCode: 401,
      message,
    });
  }
}
