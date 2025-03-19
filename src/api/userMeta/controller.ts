import express, { NextFunction, Request, Response } from 'express';

import { UserMeta, UserMetaCrud } from './meta.crud';
import { CreateMetaSchema, CreateFcmTokenSchema } from './validation.schema';

import { ErrorMessages } from '~/core/dictionary/error.messages';
import {
  BadRequestError,
  UnauthorizedError,
  UnprocessableEntityError,
} from '~/core/errors';
import { logger } from '~/core/logger';
import { authMiddleware } from '~/core/middleware/auth';
import { modelToPlain } from '~/core/utils';
import { isAuthenticated } from '~/shared/user';

const route = express.Router();

route.post(
  '/save',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!isAuthenticated(user)) {
      return next(new UnauthorizedError(ErrorMessages.unauthorized));
    }
    try {
      logger.info(`[${req.traceId}] Body: ${JSON.stringify(req.body)}`);

      const validationResult = CreateMetaSchema.safeParse(req.body);

      if (!validationResult.success) {
        throw new UnprocessableEntityError(
          validationResult.error.errors[0].message,
        );
      }

      const userMeta = req.body;

      await UserMetaCrud.saveMeta({
        userId: user.id,
        isWelcomeFlowPassed: userMeta.isWelcomeFlowPassed,
      });

      return res.status(200).json({ success: true });
    } catch (error: unknown) {
      logger.error(`Error saving user meta: ${error}`);
      return res.status(404).json({ isSuccess: false, error });
    }
  },
);

route.get(
  '/',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!isAuthenticated(user)) {
      return next(new UnauthorizedError(ErrorMessages.unauthorized));
    }

    logger.info(`[${req.traceId}] Get user meta started by: ${user.email}`);

    const userMetaEntity = await UserMetaCrud.getMetaByUserId(user.id);

    if (!userMetaEntity) {
      throw new BadRequestError(`User meta entity does not exist`);
    }

    const userMeta = modelToPlain<UserMeta>(userMetaEntity);

    res.status(200).json(userMeta);
  },
);

route.post(
  '/save/fcm-token',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!isAuthenticated(user)) {
      return next(new UnauthorizedError(ErrorMessages.unauthorized));
    }
    try {
      logger.info(`[${req.traceId}] Body: ${JSON.stringify(req.body)}`);

      const validationResult = CreateFcmTokenSchema.safeParse(req.body);

      if (!validationResult.success) {
        throw new UnprocessableEntityError(
          validationResult.error.errors[0].message,
        );
      }

      const userMeta = req.body;

      await UserMetaCrud.saveFcmToken({
        userId: user.id,
        fcmToken: userMeta.fcmToken,
      });

      return res.status(200).json({ success: true });
    } catch (error: unknown) {
      logger.error(`Error saving user meta: ${error}`);
      return res.status(404).json({ isSuccess: false, error });
    }
  },
);

export default route;
