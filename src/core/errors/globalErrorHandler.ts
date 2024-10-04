import * as Sentry from '@sentry/node';
import { Request, Response } from 'express';

import { BaseError } from './BaseError';
import { logger } from '../logger';

export const globalErrorHandler = (
  err: BaseError | Error,
  req: Request,
  res: Response,
) => {
  const traceId = req.traceId || 'N/A';

  Sentry.captureException(err);

  logger.error(`[Error ${traceId}] ${err.message} | Stack: ${err.stack}`);

  if (err instanceof BaseError) {
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
