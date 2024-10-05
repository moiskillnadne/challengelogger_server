import * as Sentry from '@sentry/node';
import { Request, Response } from 'express';

import { logger } from '../../logger';

import {
  BadRequestError,
  UnauthorizedError,
  UnprocessableEntityError,
  ValidationError,
} from '~/core/errors';

export const exceptionsHandlerMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
) => {
  const traceId = 'N/A'; // TODO: Will be added soon

  Sentry.captureException(err);

  logger.error(`[Error ${traceId}] ${JSON.stringify(err)}`);

  const isAppCustomErrors =
    err instanceof ValidationError ||
    err instanceof BadRequestError ||
    err instanceof UnauthorizedError ||
    err instanceof UnprocessableEntityError;

  if (isAppCustomErrors) {
    return res.status(err.statusCode).json({
      isError: true,
      type: err.type,
      message: err.message,
    });
  }

  return res.status(500).json({
    isError: true,
    type: 'SERVER_INTERNAL_ERROR',
    message: 'Internal Server Error',
  });
};
