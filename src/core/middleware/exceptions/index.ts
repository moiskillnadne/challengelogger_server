import * as Sentry from '@sentry/node';
import { Request, Response } from 'express';

import { logger } from '../../logger';

export const exceptionsHandlerMiddleware = (
  err: Error,
  req: Request,
  res: Response,
) => {
  const traceId = 'N/A';

  Sentry.captureException(err);

  logger.error(`[Error ${traceId}] ${err.message} | Stack: ${err.stack}`);

  if (err instanceof Error) {
    return res.status(404).json({
      type: 'CUSTOM_TYPE_HERE',
      message: err.message,
    });
  } else {
    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }
};
