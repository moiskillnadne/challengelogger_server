import cookie from 'cookie';
import { NextFunction, Request, Response } from 'express';

import { BadRequestError, UnauthorizedError } from '~/core/errors';
import { jwtService } from '~/core/utils';
import { User } from '~/shared/user';
import { UserCrudService } from '~/shared/user/User.crud';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const middlewarePrefix: string = 'Authentication required:';

  try {
    const reqCookie = req.headers.cookie;

    if (!reqCookie) {
      throw new UnauthorizedError(`${middlewarePrefix} Cookies undefined`);
    }

    const cookies = cookie.parse(reqCookie);

    const accessToken = cookies['accessToken'] ?? null;

    if (!accessToken) {
      throw new UnauthorizedError(
        `${middlewarePrefix} Auth token is undefined`,
      );
    }

    const decoded = jwtService.verifyToken(accessToken);

    if (typeof decoded === 'string') {
      throw new BadRequestError(
        `${middlewarePrefix} Decoded JWT is string for some reason. Decoded result is ${decoded}`,
      );
    }

    const emailFromToken: string | null = decoded['email'] ?? null;

    if (!emailFromToken) {
      throw new UnauthorizedError(`${middlewarePrefix} Email is undefined`);
    }

    const user = await UserCrudService.getUserByEmail(emailFromToken);

    if (!user) {
      throw new UnauthorizedError(`${middlewarePrefix} User not found`);
    }

    req.user = user?.toJSON() as unknown as User;

    next();
  } catch (err: unknown) {
    return next(err);
  }
};
