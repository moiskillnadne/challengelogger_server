import { ZodError } from 'zod';

import { AppBaseError } from './AppBaseError';

import { ErrorTypes } from '~/core/dictionary/error.types';

export class ZodValidationError extends AppBaseError {
  constructor(error: ZodError) {
    super({
      type: ErrorTypes.validation,
      statusCode: 400,
      message: error.issues[0].message, // Take first error from the array of issues
    });
  }
}
