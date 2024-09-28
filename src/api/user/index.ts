import express, { Request, Response } from 'express';

import { authMiddleware, AuthorizedRequest } from '~/core/middleware/auth';

const route = express.Router();

route.use(authMiddleware);

route.get('/test', (req: Request, res: Response) => {
  const user = (req as AuthorizedRequest).user;

  res.status(200).send({ message: `Hello, ${user.email}` });
});

export default route;
