import * as Sentry from '@sentry/node';
import { NextFunction, Request, Response } from 'express';

import { Cookies } from '../../constants';
import { logger } from '../../logger';

import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  UnprocessableEntityError,
} from '~/core/errors';

const SEQUELIZE_UNIQUE_CONSTRAINT_ERROR = 'SequelizeUniqueConstraintError';

export const exceptionsHandlerMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  const traceId = req.traceId ?? 'N/A';

  Sentry.captureException(err);

  logger.error(`[Error ${traceId}] ${JSON.stringify(err)}`);

  if (err instanceof UnauthorizedError) {
    res.clearCookie(Cookies.accessToken);
    res.clearCookie(Cookies.refreshToken);

    return res.status(err.statusCode).json({
      isError: true,
      type: err.type,
      message: err.message,
    });
  }

  const isAppCustomErrors =
    err instanceof BadRequestError ||
    err instanceof UnprocessableEntityError ||
    err instanceof NotFoundError;

  if (isAppCustomErrors) {
    return res.status(err.statusCode).json({
      isError: true,
      type: err.type,
      message: err.message,
    });
  }

  if (err instanceof Error) {
    if (err.name === SEQUELIZE_UNIQUE_CONSTRAINT_ERROR) {
      return res.status(409).json({
        isError: true,
        type: 'UNIQUE_CONSTRAINT_ERROR',
        message: 'Unique constraint error',
      });
    }
  }

  return res.status(500).json({
    isError: true,
    type: 'SERVER_INTERNAL_ERROR',
    message: 'Internal Server Error',
  });
};
