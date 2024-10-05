import * as Sentry from '@sentry/node';
import { NextFunction, Request, Response } from 'express';

import { logger } from '../../logger';

import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  UnprocessableEntityError,
} from '~/core/errors';

export const exceptionsHandlerMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  const traceId = 'N/A'; // TODO: Will be added soon

  Sentry.captureException(err);

  logger.error(`[Error ${traceId}] ${JSON.stringify(err)}`);

  const isAppCustomErrors =
    err instanceof BadRequestError ||
    err instanceof UnauthorizedError ||
    err instanceof UnprocessableEntityError ||
    err instanceof NotFoundError;

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
