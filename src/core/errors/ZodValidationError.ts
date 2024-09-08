import { Response } from 'express';
import { ZodError, ZodIssue } from 'zod';

import { AppResponse } from '~/core/interfaces';

export class ZodValidationError extends Error {
  private issues: ZodIssue[];

  private statusCode: number = 400;

  constructor(error: ZodError) {
    super();

    this.issues = error.issues;
  }

  public send(res: Response): void {
    const firstIssue = this.issues[0];

    const json: AppResponse = {
      type: 'VALIDATION_ERROR',
      statusCode: this.statusCode,
      message: firstIssue.message,
      isSuccess: false,
      details: {
        errors: this.issues,
      },
    };

    res.status(this.statusCode).json(json);
  }
}
