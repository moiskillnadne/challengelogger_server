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

/**
 * @swagger
 * /api/protected/userNotificationSettings/:
 *   get:
 *     summary: Retrieve user notification settings
 *     tags: [userNotificationSettings]
 *     security:
 *       - bearerAuth: []  # Indicates that authentication is required
 *     responses:
 *       200:
 *         description: Successfully retrieved user notification settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Unique ID of the user notification settings record
 *                   example: "notificationSettings-id"
 *                 userId:
 *                   type: string
 *                   description: ID of the user
 *                   example: "user-id"
 *                 dailyReminder:
 *                   type: boolean
 *                   description: Indicates whether the user enabled daily reminder
 *                   example: true
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: When the notification settings was created
 *                   example: "2024-01-01T12:00:00Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: When the notification settings was last updated
 *                   example: "2024-01-02T12:00:00Z"
 *       400:
 *         description: User notification settings does not exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: BAD_REQUEST
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: User notification settings entity does not exist
 *       401:
 *         description: Unauthorized - User is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: ERROR
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: SERVER_ERROR
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
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

/**
 * @swagger
 * /api/protected/userNotificationSettings/save:
 *   post:
 *     summary: Save user notification settings
 *     tags: [userNotificationSettings]
 *     security:
 *       - bearerAuth: []  # Indicates that authentication is required
 *     requestBody:
 *       required: true
 *       description: Notification settings of the user to be saved
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dailyReminder:
 *                 type: boolean
 *                 description: Indicates whether the user enabled daily reminder
 *                 example: true
 *     responses:
 *       200:
 *         description: User notification settings successfully saved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized - User is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: ERROR
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       422:
 *         description: Invalid data in the request body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: ERROR
 *                 statusCode:
 *                   type: integer
 *                   example: 422
 *                 message:
 *                   type: string
 *                   example: "Invalid data provided"
 *       404:
 *         description: Notification settings saving failed or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Error saving user notification settings"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: SERVER_ERROR
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
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

export default route;
