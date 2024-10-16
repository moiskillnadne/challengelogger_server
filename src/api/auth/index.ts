import express, { NextFunction, Request, Response } from 'express';

import { ConfirmLoginBodySchema, LoginBodySchema } from './validation.schema';

import { Cookies, Env, ONE_MINUTE, ONE_MONTH } from '~/core/constants';
import { ErrorMessages } from '~/core/dictionary/error.messages';
import {
  BadRequestError,
  UnauthorizedError,
  UnprocessableEntityError,
} from '~/core/errors/';
import { authMiddleware } from '~/core/middleware/auth';
import { generateOTP } from '~/core/utils';
import { jwtService } from '~/core/utils';
import { SendGridService } from '~/integration/SendGrid';
import { redis } from '~/redis';
import { mapToOTPKey, mapToRefreshTokenKey } from '~/redis/mappers';
import { isAuthenticated } from '~/shared/user';
import { UserCrudService } from '~/shared/user/User.crud';

const route = express.Router();

route.post(
  '/login',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validationResult = LoginBodySchema.safeParse(req.body);

      if (validationResult.success === false) {
        throw new UnprocessableEntityError(
          validationResult.error.errors[0].message,
        );
      }

      const language = req.headers['accept-language'] ?? 'RU-ru';

      const isRuLang = language === 'RU-ru';

      const [user, isCreated] = await UserCrudService.createOrGet(
        validationResult.data.email,
      );

      // Generate OTP
      const OTP = generateOTP();

      // Save OTP to Redis
      await redis.set(mapToOTPKey(validationResult.data.email), OTP, {
        EX: 60 * 15, // 15 minutes
      });

      const mailer = new SendGridService();

      await mailer.sendTemplateEmail({
        to: validationResult.data.email,
        subject: isRuLang
          ? 'Добро пожаловать в Challenge Logger'
          : 'Welcome to our Challenge Logger',
        templateId: process.env.LOGIN_OTP_TEMPLATE_ID ?? '',
        dynamicTemplateData: {
          loginEmailSubject: isRuLang
            ? `Добро пожаловать в Challenge Logger!`
            : 'Welcome to our Challenge Logger',

          welcomeTitle: isRuLang
            ? `Добро пожаловать в Challenge Logger!`
            : 'Welcome to our Challenge Logger',
          loginOTPexplanation: isRuLang
            ? `Вы вошли в систему как ${validationResult.data.email}. Ваш одноразовый пароль истечет через 15 минут.`
            : `You are logged in as ${validationResult.data.email}. Your one-time password will expire in 15 minutes.`,

          userOTP: OTP,
        },
      });

      if (isCreated) {
        return res.status(201).json({
          type: 'USER_CREATED',
          statusCode: 201,
          message: 'User created successfully',
          isSuccess: true,
          details: {
            user,
          },
        });
      } else {
        return res.status(200).json({
          type: 'USER_FETCHED',
          statusCode: 200,
          message: 'User fetched successfully',
          isSuccess: true,
          details: {
            user,
          },
        });
      }
    } catch (error: unknown) {
      return next(error);
    }
  },
);

route.post(
  '/confirm-login',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validationResult = ConfirmLoginBodySchema.safeParse(req.body);

      if (validationResult.success === false) {
        throw new UnprocessableEntityError(
          validationResult.error.errors[0].message,
        );
      }

      const OTP = await redis.get(mapToOTPKey(validationResult.data.email));

      if (OTP === null) {
        throw new BadRequestError('Code has expired');
      }

      if (OTP !== validationResult.data.code) {
        throw new BadRequestError('Wrong code');
      }

      const accessToken = jwtService.generateToken({
        secret: Env.JWT_ACCESS_SECRET ?? '',
        expiresIn: ONE_MINUTE * 15,
        payload: {
          email: validationResult.data.email,
        },
      });

      const refreshToken = jwtService.generateToken({
        secret: Env.JWT_REFRESH_SECRET ?? '',
        expiresIn: ONE_MONTH,
        payload: {
          email: validationResult.data.email,
        },
      });

      res.cookie(Cookies.accessToken, accessToken, {
        httpOnly: true,
        secure: true,
        maxAge: ONE_MINUTE * 15,
        sameSite: 'strict',
      });

      res.cookie(Cookies.refreshToken, refreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: ONE_MONTH,
        sameSite: 'strict',
        path: '/api/auth/refresh-token',
      });

      // Save refresh token to Redis (White list of refresh tokens)
      await redis.set(
        mapToRefreshTokenKey(validationResult.data.email),
        refreshToken,
        {
          EX: ONE_MONTH,
        },
      );

      await redis.del(mapToOTPKey(validationResult.data.email));

      return res.status(200).json({
        type: 'LOGIN_SUCCESS',
        statusCode: 200,
        message: 'Login successful',
        isSuccess: true,
      });
    } catch (error: unknown) {
      return next(error);
    }
  },
);

route.post(
  '/logout',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!isAuthenticated(user)) {
      return next(new UnauthorizedError(ErrorMessages.unauthorized));
    }

    res.clearCookie(Cookies.accessToken);
    res.clearCookie(Cookies.refreshToken);

    await redis.del(mapToRefreshTokenKey(user.email));

    return res.status(204).json({
      type: 'LOGOUT_SUCCESS',
      statusCode: 204,
      message: 'Logout successful',
      isSuccess: true,
    });
  },
);

route.post(
  '/refresh-token',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cookies = req.cookies;

      const refreshToken = cookies[Cookies.refreshToken] ?? null;

      const decoded = jwtService.verifyToken({
        token: refreshToken,
        secret: Env.JWT_REFRESH_SECRET ?? '',
      });

      if (typeof decoded === 'string') {
        res.clearCookie(Cookies.accessToken);
        res.clearCookie(Cookies.refreshToken);

        return res.status(404).json({
          type: 'TOKEN_EXPIRED',
          statusCode: 404,
          message: 'Token expired',
          isError: true,
        });
      }

      const emailFromToken: string | null = decoded['email'] ?? null;

      if (!emailFromToken) {
        res.clearCookie(Cookies.accessToken);
        res.clearCookie(Cookies.refreshToken);

        return res.status(404).json({
          type: 'TOKEN_EXPIRED',
          statusCode: 404,
          message: 'Token expired',
          isError: true,
        });
      }

      const refreshTokenFromRedis = await redis.get(
        mapToRefreshTokenKey(emailFromToken),
      );

      if (!refreshTokenFromRedis) {
        res.clearCookie(Cookies.accessToken);
        res.clearCookie(Cookies.refreshToken);

        return res.status(404).json({
          type: 'TOKEN_EXPIRED',
          statusCode: 404,
          message: 'Token expired',
          isError: true,
        });
      }

      const accessToken = jwtService.generateToken({
        secret: Env.JWT_ACCESS_SECRET ?? '',
        expiresIn: ONE_MINUTE * 15,
        payload: {
          email: emailFromToken,
        },
      });

      res.cookie(Cookies.accessToken, accessToken, {
        httpOnly: true,
        secure: true,
        maxAge: ONE_MINUTE * 15,
        sameSite: 'strict',
      });

      // TODO: Check the fingerprint of the device, if it's the same like "TRUST DEVICE" of user
      // then refresh the refresh token as well

      // Also need to remove old refresh token from Redis
      // and save new one

      return res.status(200).json({
        type: 'TOKEN_REFRESHED',
        statusCode: 200,
        message: 'Token refreshed',
        isSuccess: true,
      });
    } catch (error: unknown) {
      return next(error);
    }
  },
);

export default route;
