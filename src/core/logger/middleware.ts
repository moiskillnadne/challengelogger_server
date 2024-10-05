import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

import { logger } from './index';

export const hideSensitiveFieldInBody = (body: Record<string, unknown>) => {
  const copy = structuredClone(body);

  if (copy['code']) {
    copy.code = '******';
  }

  if (copy['password']) {
    copy.password = '******';
  }

  return copy;
};

export const httpLogger = (req: Request, res: Response, next: NextFunction) => {
  const traceId = randomUUID();
  const t0 = performance.now();

  const url = req.url;
  const method = req.method;
  const body = req.body;

  const formattedBody = !!Object.keys(body).length
    ? `Body: ${JSON.stringify(hideSensitiveFieldInBody(body))}`
    : '';

  logger.info(`[Request ${traceId}] ${method}: ${url} ${formattedBody}`);

  res.on('finish', () => {
    const t1 = performance.now();
    const duration = t1 - t0;

    logger.info(
      `[Response ${traceId}] ${method}: ${url} ${res.statusCode} ${res.statusMessage} (Time: ${duration}ms)`,
    );
  });

  req.traceId = traceId;

  next();
};
