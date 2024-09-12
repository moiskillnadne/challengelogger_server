import express, { Request, Response } from 'express';
import { ValidationErrorItem } from 'sequelize';

import { LoginBodySchema } from './validation.schema';

import { ZodValidationError } from '~/core/errors/ZodValidationError';
import { SendGridService } from '~/integration/SendGrid';
import { UserCrudService } from '~/shared/user/User.crud';

const route = express.Router();

route.post('/login', async (req: Request, res: Response) => {
  const validationResult = LoginBodySchema.safeParse(req.body);

  if (validationResult.success === false) {
    return new ZodValidationError(validationResult.error).send(res);
  }

  try {
    const [user, isCreated] = await UserCrudService.createOrGet(
      validationResult.data.email,
    );

    const mailer = new SendGridService();

    await mailer.sendEmail({
      to: validationResult.data.email,
      subject: 'Welcome to our platform',
      text: `Welcome to our platform, ${validationResult.data.email}!`,
      html: `<h1>Welcome to our platform, ${validationResult.data.email}!</h1>`,
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

export default route;
