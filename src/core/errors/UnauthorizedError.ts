import { BaseError } from './BaseError';

import { ErrorTypes } from '~/core/dictionary/error.types';

export class UnauthorizedError extends BaseError {
  constructor(message: string) {
    super({
      type: ErrorTypes.validation,
      statusCode: 401,
      message,
    });
  }
}
