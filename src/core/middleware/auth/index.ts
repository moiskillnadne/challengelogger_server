import { NextFunction, Request, Response } from 'express';

import { Cookies, Env } from '../../constants';
import { logger } from '../../logger';

import { UnauthorizedError } from '~/core/errors';
import { jwtService } from '~/core/utils';
import { User } from '~/shared/user';
import { UserCrudService } from '~/shared/user/User.crud';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const middlewarePrefix: string = 'Authentication required:';

  const url = req.url;
  const method = req.method;

  logger.info(
    `[authMiddleware] Request URL: ${method} ${url} start auth validation`,
  );

  try {
    const cookies = req.cookies;

    if (!cookies) {
      throw new UnauthorizedError(`${middlewarePrefix} Cookies undefined`);
    }

    logger.info(`[authMiddleware] Parsed Cookies: ${JSON.stringify(cookies)}`);

    const accessToken: string | null = cookies[Cookies.accessToken] ?? null;

    if (!accessToken) {
      throw new UnauthorizedError(
        `${middlewarePrefix} Auth token is undefined`,
      );
    }

    const decoded = jwtService.verifyToken({
      token: accessToken,
      secret: Env.JWT_ACCESS_SECRET ?? '',
    });

    logger.info(`[authMiddleware] Decoded JWT: ${JSON.stringify(decoded)}`);

    if (typeof decoded === 'string') {
      throw new UnauthorizedError(
        `${middlewarePrefix} Decoded JWT is string for some reason. Decoded result is ${decoded}`,
      );
    }

    const emailFromToken: string | null = decoded['email'] ?? null;

    if (!emailFromToken) {
      throw new UnauthorizedError(`${middlewarePrefix} Email is undefined`);
    }

    logger.info(`[authMiddleware] Email from token: ${emailFromToken}`);

    const user = await UserCrudService.getUserByEmail(emailFromToken);

    if (!user) {
      throw new UnauthorizedError(`${middlewarePrefix} User not found`);
    }

    logger.info(`[authMiddleware] User found: ${JSON.stringify(user)}`);

    req.user = user?.toJSON() as unknown as User;

    next();
  } catch (err: unknown) {
    logger.error(`[authMiddleware] Error: ${err}`);
    return next(err);
  }
};
