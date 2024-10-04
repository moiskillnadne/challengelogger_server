import '~/integration/Sentry';

import * as Sentry from '@sentry/node';
import cors from 'cors';
import express, { Request, Response } from 'express';
import helmet from 'helmet';

import AuthRouter from '~/api/auth';
import UserRoute from '~/api/user';
import ChallengeRoute from '~/api/userChallenge/controller';
import { globalErrorHandler } from '~/core/errors/globalErrorHandler';
import { logger } from '~/core/logger';
import { httpLogger } from '~/core/logger/middleware';
import { Sequelize } from '~/database';
import { redis } from '~/redis';

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

const allowedOrigins = [
  'https://challenge-tracker.riabkov.com',
  'https://challenge-tracker-api.riabkov.com',
  'http://localhost:5173',
];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
};

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors(corsOptions));
app.use(express.json());

app.use(httpLogger);

app.use('/auth', AuthRouter);

app.use('/protected/user', UserRoute);

app.use('/protected/challenge', ChallengeRoute);

app.get('/healthcheck', (req: Request, res: Response) => {
  return res.status(200).send('OK');
});

app.options('*', cors(corsOptions));

app.all('*', (req: Request, res: Response) => {
  return res.status(404).json({
    error: true,
    message: 'Endpoint not found.',
  });
});

Sentry.setupExpressErrorHandler(app);

app.use(globalErrorHandler);

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
