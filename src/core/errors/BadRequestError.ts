import { AppBaseError } from './AppBaseError';

import { ErrorTypes } from '~/core/dictionary/error.types';

export class BadRequestError extends AppBaseError {
  constructor(message: string) {
    super({
      type: ErrorTypes.BadRequest,
      statusCode: 400,
      message,
    });
  }
}
