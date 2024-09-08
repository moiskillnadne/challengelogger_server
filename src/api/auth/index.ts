import express, { Request, Response } from 'express';
import { ValidationErrorItem } from 'sequelize';

import { User } from '~/database/models/User';

const route = express.Router();

route.post('/login', async (req: Request, res: Response) => {
  const body = req.body;

  if (!body?.email) {
    return res.status(400).json({
      isError: true,
      type: 'FIELD_REQUIRED',
      message: 'Email is required',
    });
  }

  try {
    const user = await User.create({ email: body.email });
    return res.status(201).json({
      message: 'User created',
      user,
    });
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
