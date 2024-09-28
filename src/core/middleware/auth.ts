import cookie from 'cookie';
import { NextFunction, Request, Response } from 'express';

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
  try {
    const reqCookie = req.headers.cookie;

    if (!reqCookie) {
      throw new Error('Cookies undefined');
    }

    const cookies = cookie.parse(reqCookie);

    const authToken = cookies['authToken'] ?? null;

    if (!authToken) {
      throw new Error('Auth token undefined');
    }

    const decoded = jwtService.verifyToken(authToken);

    if (typeof decoded === 'string') {
      throw new Error(
        `Decoded JWT is string for some reason. Decoded result is ${decoded}`,
      );
    }

    const emailFromToken: string | null = decoded['email'] ?? null;

    if (!emailFromToken) {
      throw new Error(`User email in token is undefined`);
    }

    const user = await UserCrudService.getUserByEmail(emailFromToken);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const jsonUser = user?.toJSON() as unknown as User;

    (req as AuthorizedRequest)['user'] = jsonUser;

    next();
  } catch (err: unknown) {
    console.error(err);

    return res.status(401).json({ message: 'Invalid token' });
  }
};
