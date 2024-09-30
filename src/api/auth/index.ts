import express, { Request, Response } from 'express';
import { ValidationErrorItem } from 'sequelize';

import { ConfirmLoginBodySchema, LoginBodySchema } from './validation.schema';

import { ZodValidationError } from '~/core/errors/ZodValidationError';
import { generateOTP } from '~/core/utils';
import { jwtService } from '~/core/utils';
import { SendGridService } from '~/integration/SendGrid';
import { redis } from '~/redis';
import { UserCrudService } from '~/shared/user/User.crud';
import { getEmailLoginTemplate } from '~/templates/getEmailLoginTemplate';

const route = express.Router();

route.post('/login', async (req: Request, res: Response) => {
  const validationResult = LoginBodySchema.safeParse(req.body);

  if (validationResult.success === false) {
    return new ZodValidationError(validationResult.error).send(res);
  }

  const language = req.headers['accept-language'] ?? 'RU-ru';

  const isRuLang = language === 'RU-ru';

  try {
    const [user, isCreated] = await UserCrudService.createOrGet(
      validationResult.data.email,
    );

    // Generate OTP
    const OTP = generateOTP();

    // Save OTP to Redis
    await redis.set(validationResult.data.email, OTP, {
      EX: 60 * 15, // 15 minutes
    });

    const mailer = new SendGridService();

    await mailer.sendEmail({
      to: validationResult.data.email,
      subject: isRuLang
        ? 'Добро пожаловать в Challenge Logger'
        : 'Welcome to our Challenge Logger',
      html: getEmailLoginTemplate({
        h2: isRuLang
          ? `Добро пожаловать в Challenge Logger!`
          : 'Welcome to our Challenge Logger',
        p: isRuLang
          ? `Вы вошли в систему как ${validationResult.data.email}. Ваш одноразовый пароль - ${OTP}`
          : `You are logged in as ${validationResult.data.email}. Your one time password - ${OTP}`,
        passwordExpiresIn: isRuLang
          ? 'Ваш одноразовый пароль истечет через 15 минут.'
          : 'Your one-time password will expire in 15 minutes.',
      }),
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
  } catch (error: any) {
    if (error?.errors?.[0] instanceof ValidationErrorItem) {
      return res.status(400).json({
        isError: true,
        type: 'VALIDATION_ERROR',
        message: error?.errors?.[0].message,
        details: error?.errors?.[0],
      });
    }

    return res.status(500).json({ isError: true });
  }
});

route.post('/confirm-login', async (req: Request, res: Response) => {
  const validationResult = ConfirmLoginBodySchema.safeParse(req.body);

  if (validationResult.success === false) {
    return new ZodValidationError(validationResult.error).send(res);
  }

  const OTP = await redis.get(validationResult.data.email);

  if (OTP === null) {
    return res.status(400).json({
      isError: true,
      type: 'OTP_EXPIRED',
      message: 'Code has expired',
    });
  }

  if (OTP !== validationResult.data.code) {
    return res.status(400).json({
      isError: true,
      type: 'OTP_INCORRECT',
      message: 'Wrong code',
    });
  }

  const token = jwtService.generateToken({
    email: validationResult.data.email,
  });

  res.cookie('authToken', token, {
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'none',
  });

  await redis.del(validationResult.data.email);

  return res.status(200).json({
    type: 'LOGIN_SUCCESS',
    statusCode: 200,
    message: 'Login successful',
    isSuccess: true,
  });
});

export default route;
