import express, { NextFunction, Request, Response } from 'express';

import { ErrorMessages } from '~/core/dictionary/error.messages';
import { UnauthorizedError, UnprocessableEntityError } from '~/core/errors';
import { isAuthenticated } from '~/shared/user';
import { UpdateUserLogoSchema } from '~/shared/user/schema';
import { UserCrudService } from '~/shared/user/User.crud';

const route = express.Router();

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

route.post('/logo', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;

    if (!isAuthenticated(user)) {
      return next(new UnauthorizedError(ErrorMessages.unauthorized));
    }

    const parsedBody = UpdateUserLogoSchema.safeParse(req.body);

    if (parsedBody.error) {
      throw new UnprocessableEntityError(parsedBody.error.errors[0].message);
    }

    await UserCrudService.update(
      {
        logo: parsedBody.data.logo,
      },
      user.id,
    );

    return res.status(201).json({
      type: 'USER_LOGO_UPDATED',
      statusCode: 201,
      message: `User logo updated successfully.`,
      isSuccess: true,
      details: {
        user,
      },
    });
  } catch (error: unknown) {
    return next(error);
  }
});

route.delete(
  '/logo',
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!isAuthenticated(user)) {
      return next(new UnauthorizedError(ErrorMessages.unauthorized));
    }

    try {
      await UserCrudService.deleteLogo(user.id);

      return res.status(200).json({
        type: 'USER_LOGO_DELETED',
        statusCode: 200,
        message: 'User logo deleted successfully',
        isSuccess: true,
      });
    } catch (error: unknown) {
      return next(error);
    }
  },
);

export default route;
