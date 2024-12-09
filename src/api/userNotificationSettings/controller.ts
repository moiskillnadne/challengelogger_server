import express, { NextFunction, Request, Response } from 'express';

import {
  UserNotificationSettings,
  UserNotificationSettingsCrud,
} from './notificationSettings.crud';
import { CreateNotificcationSettingsSchema } from './validation.schema';

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

      const validationResult = CreateNotificcationSettingsSchema.safeParse(
        req.body,
      );

      if (!validationResult.success) {
        throw new UnprocessableEntityError(
          validationResult.error.errors[0].message,
        );
      }

      const userNotificationSettings = req.body;

      await UserNotificationSettingsCrud.saveNotificationSettings({
        userId: user.id,
        dailyReminder: userNotificationSettings.dailyReminder,
      });

      return res.status(200).json({ success: true });
    } catch (error: unknown) {
      logger.error(`Error saving user notification settings: ${error}`);
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

    logger.info(
      `[${req.traceId}] Get user notification settings started by: ${user.email}`,
    );

    const userNotificationSettingsEntity =
      await UserNotificationSettingsCrud.getNotificationSettingsByUserId(
        user.id,
      );

    if (!userNotificationSettingsEntity) {
      throw new BadRequestError(
        `User notification settings entity does not exist`,
      );
    }

    const userNotificationSettings = modelToPlain<UserNotificationSettings>(
      userNotificationSettingsEntity,
    );

    res.status(200).json(userNotificationSettings);
  },
);

export default route;
