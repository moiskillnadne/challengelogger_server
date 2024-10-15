import '~/integration/Sentry';

import * as Sentry from '@sentry/node';
import cookieParser from 'cookie-parser';
import express, { Request, Response } from 'express';
import helmet from 'helmet';

import { redis } from './redis';

import AuthRouter from '~/api/auth';
import UserRoute from '~/api/user';
import ChallengeRoute from '~/api/userChallenge/controller';
import { Env } from '~/core/constants';
import { logger } from '~/core/logger';
import { httpLogger } from '~/core/logger/middleware';
import { authMiddleware } from '~/core/middleware/auth';
import { exceptionsHandlerMiddleware } from '~/core/middleware/exceptions';
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
const PORT = Env.APP_PORT || 3000;

app.use(helmet());

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.use(httpLogger);

app.use('/api/auth', AuthRouter);

app.use('/api/protected/user', authMiddleware, UserRoute);

app.use('/api/protected/challenge', authMiddleware, ChallengeRoute);

app.get('/api/healthcheck', (req: Request, res: Response) => {
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
