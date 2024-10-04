import cookie from 'cookie';
import { NextFunction, Request, Response } from 'express';

import { logger } from '../../logger';

import { IUser } from '~/api/user/interfaces';
import { ErrorMessages } from '~/core/dictionary/error.messages';
import { UnauthorizedError } from '~/core/errors/UnauthorizedError';
import { jwtService } from '~/core/utils';
import { UserCrudService } from '~/shared/user/User.crud';

export const middleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const reqCookie = req.headers.cookie;

    if (!reqCookie) {
      throw new UnauthorizedError('Cookies undefined');
    }

    const cookies = cookie.parse(reqCookie);

    const authToken = cookies['authToken'] ?? null;

    if (!authToken) {
      throw new UnauthorizedError('Auth token undefined');
    }

    const decoded = jwtService.verifyToken(authToken);

    if (typeof decoded === 'string') {
      throw new UnauthorizedError(
        `Decoded JWT is string for some reason. Decoded result is ${decoded}`,
      );
    }

    const emailFromToken: string | null = decoded['email'] ?? null;

    if (!emailFromToken) {
      throw new UnauthorizedError(`User email in token is undefined`);
    }

    const user = await UserCrudService.getUserByEmail(emailFromToken);

    if (!user) {
      throw new UnauthorizedError(ErrorMessages.unauthorized);
    }

    req.user = user?.toJSON() as unknown as IUser;

    next();
  } catch (err: unknown) {
    logger.error(err);

    throw new UnauthorizedError(ErrorMessages.invalidToken);
  }
};
