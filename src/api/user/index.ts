import express, { Request, Response } from 'express';

import { ErrorMessages } from '~/core/dictionary/error.messages';
import { UnauthorizedError } from '~/core/errors/UnauthorizedError';
import { authMiddleWare } from '~/core/middleware/authorization';

const route = express.Router();

route.use(authMiddleWare);

route.get('/', (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new UnauthorizedError(ErrorMessages.unauthorized);
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
