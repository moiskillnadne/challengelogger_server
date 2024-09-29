import express, { Request, Response } from 'express';

import { authMiddleware, AuthorizedRequest } from '~/core/middleware/auth';

const route = express.Router();

route.use(authMiddleware);

route.get('/', (req: Request, res: Response) => {
  const user = (req as AuthorizedRequest).user;

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
