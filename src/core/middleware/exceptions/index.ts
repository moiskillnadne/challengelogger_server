import * as Sentry from '@sentry/node';
import { Request, Response } from 'express';

import { logger } from '../../logger';

import { AppBaseError } from '~/core/errors/AppBaseError';

export const exceptionsHandlerMiddleware = (
  err: AppBaseError | Error,
  req: Request,
  res: Response,
) => {
  const traceId = 'N/A';

  Sentry.captureException(err);

  logger.error(`[Error ${traceId}] ${err.message} | Stack: ${err.stack}`);

  if (err instanceof AppBaseError) {
    return res.status(err.statusCode).json({
      type: err.type,
      message: err.message,
    });
  } else {
    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }
};
