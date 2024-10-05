import express, { NextFunction, Request, Response } from 'express';

import { ErrorMessages } from '~/core/dictionary/error.messages';
import { UnauthorizedError } from '~/core/errors';
import { authMiddleware } from '~/core/middleware/auth';
import { isAuthenticated } from '~/shared/user';

const route = express.Router();

route.use(authMiddleware);

route.get('/', (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

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
