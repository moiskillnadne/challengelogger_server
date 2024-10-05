import cookie from 'cookie';
import { NextFunction, Request, Response } from 'express';

import { logger } from '../../logger';

import { BadRequestError, UnauthorizedError } from '~/core/errors';
import { jwtService } from '~/core/utils';
import { User } from '~/database/models/User';
import { UserCrudService } from '~/shared/user/User.crud';

interface User {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
}

export type AuthorizedRequest = Request & {
  user: User;
};

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

    const authToken = cookies['authToken'] ?? null;

    if (!authToken) {
      throw new UnauthorizedError(
        `${middlewarePrefix} Auth token is undefined`,
      );
    }

    const decoded = jwtService.verifyToken(authToken);

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

    const jsonUser = user?.toJSON() as unknown as User;

    (req as AuthorizedRequest)['user'] = jsonUser;

    next();
  } catch (err: unknown) {
    logger.error(err);

    if (err instanceof UnauthorizedError) {
      return res.status(401).json({ message: err.message });
    }

    if (err instanceof BadRequestError) {
      return res.status(400).json({ message: err.message });
    }

    return res
      .status(500)
      .json({ message: `${middlewarePrefix} Internal server error` });
  }
};
