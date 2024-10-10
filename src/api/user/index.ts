import express, { NextFunction, Request, Response } from 'express';

import { ErrorMessages } from '~/core/dictionary/error.messages';
import { UnauthorizedError } from '~/core/errors';
import { logger } from '~/core/logger';
import { authMiddleware } from '~/core/middleware/auth';
import { isAuthenticated } from '~/shared/user';

const route = express.Router();

route.use(authMiddleware);

const getFingerprint = (req: Request) => {
  const userAgent = req.headers['user-agent'] || '';
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const acceptLanguage = req.headers['accept-language'] || '';
  const platform = req.headers['sec-ch-ua-platform'] || ''; // Платформа, например, "Windows" или "macOS"

  logger.info(`User-Agent: ${userAgent}`);
  logger.info(`IP: ${ip}`);
  logger.info(`Accept-Language: ${acceptLanguage}`);
  logger.info(`Platform: ${platform}`);
};

route.get('/', (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  getFingerprint(req);

  if (!isAuthenticated(user)) {
    return next(new UnauthorizedError(ErrorMessages.unauthorized));
  }

  return res.status(200).json({
    type: 'USER_FETCHED',
    statusCode: 200,
    message: 'User fetched successfully',
    isSuccess: true,
    details: {
      user,
    },
  });
});

export default route;
