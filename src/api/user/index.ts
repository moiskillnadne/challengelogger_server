import express, { NextFunction, Request, Response } from 'express';

import { ErrorMessages } from '~/core/dictionary/error.messages';
import { UnauthorizedError } from '~/core/errors';
import { logger } from '~/core/logger';
import { isAuthenticated } from '~/shared/user';

const route = express.Router();

route.get('/', (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  logger.info(`[GET /protected/user] User: ${JSON.stringify(user)}`);

  if (!isAuthenticated(user)) {
    return next(
      new UnauthorizedError(
        `[GET /protected/user] ${ErrorMessages.unauthorized}`,
      ),
    );
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
