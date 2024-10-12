import '~/integration/Sentry';

import * as Sentry from '@sentry/node';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import helmet from 'helmet';

import { logger } from './core/logger';
import { httpLogger } from './core/logger/middleware';
import { exceptionsHandlerMiddleware } from './core/middleware/exceptions';

import { redis } from './redis';

import AuthRouter from '~/api/auth';
import UserRoute from '~/api/user';
import ChallengeRoute from '~/api/userChallenge/controller';
import { Sequelize } from '~/database';

// Setup associations
import '~/database/models/association';

process.on('uncaughtException', (err: Error) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  Sentry.captureException(err);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.error(`Unhandled Rejection: ${reason}`);
  Sentry.captureException(reason);
});

const app = express();
const PORT = process.env.PORT || 3000;

if (process.env.ENV === 'dev') {
  app.use(
    cors({
      origin: ['http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
    }),
  );
}

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.use(httpLogger);

app.use('/auth', AuthRouter);

app.use('/protected/user', UserRoute);

app.use('/protected/challenge', ChallengeRoute);

app.get('/healthcheck', (req: Request, res: Response) => {
  return res.status(200).send('OK');
});

app.all('*', (req: Request, res: Response) => {
  return res.status(404).json({
    error: true,
    message: 'Endpoint not found.',
  });
});

app.use(exceptionsHandlerMiddleware);

app.listen(PORT, async () => {
  logger.info(`Server is running on port ${PORT}`);

  await redis.connect();

  try {
    await Sequelize.authenticate();
    logger.info('Database connected.');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
  }
});
