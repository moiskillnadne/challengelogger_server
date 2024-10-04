import { ZodError } from 'zod';

import { BaseError } from './BaseError';

import { ErrorTypes } from '~/core/dictionary/error.types';

export class ZodValidationError extends BaseError {
  constructor(error: ZodError) {
    super({
      type: ErrorTypes.validation,
      statusCode: 400,
      message: error.issues[0].message, // Take first error from the array of issues
    });
  }
}
