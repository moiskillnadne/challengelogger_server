import express, { Request, Response } from 'express';

// import { ErrorMessages } from '~/core/dictionary/error.messages';
// import { UnauthorizedError } from '~/core/errors';
import { logger } from '~/core/logger';
// import { isAuthenticated } from '~/shared/user';

const route = express.Router();

route.get('/', (req: Request, res: Response) => {
  const user = req.user;

  logger.info(`[GET /protected/user] User: ${JSON.stringify(user)}`);

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
