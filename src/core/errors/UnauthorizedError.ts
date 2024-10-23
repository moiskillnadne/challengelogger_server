import { AppBaseError } from './AppBaseError';

import { ErrorTypes } from '~/core/dictionary/error.types';

export class UnauthorizedError extends AppBaseError {
  constructor(message: string, specificType?: string) {
    super({
      type: ErrorTypes.Unauthorized,
      specificType: specificType,
      statusCode: 401,
      message,
    });
  }
}
