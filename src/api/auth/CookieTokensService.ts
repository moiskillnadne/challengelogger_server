import { Response } from 'express';

import { Cookies, ONE_MINUTE, ONE_MONTH } from '../../core/constants';
import { isProduction } from '../../core/utils';

export class CookieTokensService {
  static setAccessTokenCookie(res: Response, token: string): void {
    res.cookie(Cookies.accessToken, token, {
      httpOnly: true,
      secure: true,
      maxAge: ONE_MINUTE * 15,
      sameSite: isProduction ? 'strict' : 'none',
    });
  }

  static setRefreshTokenCookie(res: Response, token: string): void {
    // Set cookie for refresh token endpoint
    res.cookie(Cookies.refreshToken, token, {
      httpOnly: true,
      secure: true,
      maxAge: ONE_MONTH,
      sameSite: isProduction ? 'strict' : 'none',
      path: '/api/auth/refresh-token',
    });

    // Set cookie for logout endpoint
    res.cookie(Cookies.refreshToken, token, {
      httpOnly: true,
      secure: true,
      maxAge: ONE_MONTH,
      sameSite: isProduction ? 'strict' : 'none',
      path: '/api/auth/logout',
    });
  }

  static clearCookies(res: Response): void {
    // Clear access
    res.clearCookie(Cookies.accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: ONE_MINUTE * 15,
      sameSite: isProduction ? 'strict' : 'none',
    });

    // Clear refresh for logout
    res.clearCookie(Cookies.refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: ONE_MONTH,
      sameSite: isProduction ? 'strict' : 'none',
      path: '/api/auth/logout',
    });

    // Clear refresh for refresh
    res.clearCookie(Cookies.refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: ONE_MONTH,
      sameSite: isProduction ? 'strict' : 'none',
      path: '/api/auth/refresh-token',
    });
  }
}
