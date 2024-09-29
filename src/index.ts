import express, { Request, Response } from 'express';
import helmet from 'helmet';

import { redis } from './redis';

import AuthRouter from '~/api/auth';
import UserRoute from '~/api/user';
import { Sequelize } from '~/database';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(express.json());

app.use('/auth', AuthRouter);

app.use('/protected/user', UserRoute);

app.get('/healthcheck', (req: Request, res: Response) => {
  return res.status(200).send('OK');
});

app.all('*', (req: Request, res: Response) => {
  return res.status(404).json({
    error: true,
    message: 'Endpoint not found.',
  });
});

app.listen(PORT, async () => {
  console.info(`Server is running on port ${PORT}`);

  await redis.connect();

  try {
    await Sequelize.authenticate();
    console.info('Database connected.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
});
