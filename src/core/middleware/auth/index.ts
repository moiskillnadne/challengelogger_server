import { NextFunction, Request, Response } from 'express';

import { SpecificErrorTypes } from '../../dictionary/error.types';

import { Cookies, Env } from '~/core/constants';
import { UnauthorizedError } from '~/core/errors';
import { logger } from '~/core/logger';
import { jwtService } from '~/core/utils';
import { User } from '~/shared/user';
import { UserCrudService } from '~/shared/user/User.crud';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const middlewarePrefix: string = `[${req.traceId ?? 'N/A'}] AuthGuard:`;

  try {
    const cookies = req.cookies;

    if (!cookies) {
      throw new UnauthorizedError(
        `${middlewarePrefix} Cookies undefined. Cookies: ${JSON.stringify(cookies)}`,
        SpecificErrorTypes.Unauthorized.CookiesUndefined,
      );
    }

    const accessToken: string | null = cookies[Cookies.accessToken] ?? null;

    if (!accessToken) {
      throw new UnauthorizedError(
        `${middlewarePrefix} ${Cookies.accessToken} is undefined. Cookies: ${JSON.stringify(cookies)}`,
        SpecificErrorTypes.Unauthorized.AccessTokenUndefined,
      );
    }

    const tokenData = jwtService.verifyToken({
      token: accessToken,
      secret: Env.JWT_ACCESS_SECRET ?? '',
    });

    logger.info(
      `${middlewarePrefix} Decoded JWT: ${JSON.stringify(tokenData)}`,
    );

    if (typeof tokenData === 'string') {
      throw new UnauthorizedError(
        `${middlewarePrefix} Decoded JWT is string for some reason. Decoded result is ${tokenData}`,
        SpecificErrorTypes.Unauthorized.TokenUnprocessable,
      );
    }

    const emailFromToken: string | null = tokenData['email'] ?? null;

    if (!emailFromToken) {
      throw new UnauthorizedError(
        `${middlewarePrefix} Email is undefined.`,
        SpecificErrorTypes.Unauthorized.UserNotFound,
      );
    }

    const user = await UserCrudService.getUserByEmail(emailFromToken);

    if (!user) {
      throw new UnauthorizedError(
        `${middlewarePrefix} User not found`,
        SpecificErrorTypes.Unauthorized.UserNotFound,
      );
    }

    req.user = user?.toJSON() as unknown as User;

    next();
  } catch (err: unknown) {
    return next(err);
  }
};
