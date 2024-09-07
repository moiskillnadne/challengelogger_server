import express, { Request, Response } from 'express';
import { ValidationErrorItem } from 'sequelize';

import { User } from './database/models/User';

import { Sequelize } from '~/database';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/auth/login', async (req: Request, res: Response) => {
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

app.listen(PORT, async () => {
  console.info(`Server is running on port ${PORT}`);

  try {
    await Sequelize.authenticate();
    console.info('Connection has been established successfully.');

    await Sequelize.sync();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
});
