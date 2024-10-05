import { AppBaseError } from './AppBaseError';

import { ErrorTypes } from '~/core/dictionary/error.types';

export class NotFoundError extends AppBaseError {
  constructor(message: string) {
    super({
      type: ErrorTypes.NotFound,
      statusCode: 404,
      message,
    });
  }
}
