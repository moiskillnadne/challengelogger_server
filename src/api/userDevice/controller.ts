import express, { NextFunction, Request, Response } from 'express';

import {
  UserDevice,
  UserDeviceCrud,
  UserDeviceResult,
} from '~/api/userDevice/device.crud';
import { CreateDeviceSchema } from '~/api/userDevice/validation.schema';
import { ErrorMessages } from '~/core/dictionary/error.messages';
import {
  NotFoundError,
  UnauthorizedError,
  UnprocessableEntityError,
} from '~/core/errors';
import { logger } from '~/core/logger';
import { authMiddleware } from '~/core/middleware/auth';
import { modelToPlain } from '~/core/utils';
import { isAuthenticated } from '~/shared/user';

const route = express.Router();

route.post(
  '/save-device-meta',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!isAuthenticated(user)) {
      return next(new UnauthorizedError(ErrorMessages.unauthorized));
    }
    try {
      logger.info(`[${req.traceId}] Body: ${JSON.stringify(req.body)}`);

      const validationResult = CreateDeviceSchema.safeParse(req.body);

      if (!validationResult.success) {
        throw new UnprocessableEntityError(
          validationResult.error.errors[0].message,
        );
      }

      const deviceInfo = req.body;

      await UserDeviceCrud.saveDevice({
        userId: user.id,
        fingerprint: deviceInfo.fingerprint,
        platform: deviceInfo.platform,
        platformVersion: deviceInfo.platformVersion,
        browser: deviceInfo.browser,
        browserVersion: deviceInfo.browserVersion,
        screenResolution: deviceInfo.screenResolution,
        colorDepth: deviceInfo.colorDepth,
        pixelDepth: deviceInfo.pixelDepth,
        webGLFingerprint: deviceInfo.webGLFingerprint,
        pixelRatio: deviceInfo.pixelRatio,
        maxTouchPoints: deviceInfo.maxTouchPoints,
        isTouchScreen: deviceInfo.isTouchScreen,
        canvasFingerprint: deviceInfo.canvasFingerprint,
        userAgent: deviceInfo.userAgent,
      });

      return res.status(200).json({ success: true });
    } catch (error: unknown) {
      logger.error(`Error verifying device-meta: ${error}`);
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

    logger.info(`[${req.traceId}] Get user devices started by: ${user.email}`);

    const userDevicesEntities = await UserDeviceCrud.getDevicesByUserId(
      user.id,
    );

    const userDevices = modelToPlain<Array<UserDevice>>(userDevicesEntities);

    const userDevicesResult: UserDeviceResult[] = userDevices.map((device) => ({
      id: device.id,
      createdAt: device.createdAt,
      updatedAt: device.updatedAt,
      platform: device.platform,
      platformVersion: device.platformVersion,
      browser: device.browser,
      browserVersion: device.browserVersion,
      screenResolution: device.screenResolution,
      colorDepth: device.colorDepth,
      pixelDepth: device.pixelDepth,
      webGLFingerprint: device.webGLFingerprint,
      pixelRatio: device.pixelRatio,
      maxTouchPoints: device.maxTouchPoints,
      isTouchScreen: device.isTouchScreen,
      userAgent: device.userAgent,
      userId: device.userId,
    }));

    res.status(200).json(userDevicesResult);
  },
);

route.delete(
  '/:deviceId',
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!isAuthenticated(user)) {
      return next(new UnauthorizedError(ErrorMessages.unauthorized));
    }

    const deviceId = req.params.deviceId;

    try {
      const deleteResult = await UserDeviceCrud.deleteOneByParams({
        id: deviceId,
        userId: user.id,
      });

      if (deleteResult === 0) {
        throw new NotFoundError('Device not found');
      }

      return res.status(200).json({
        type: 'DEVICE_DELETED',
        statusCode: 200,
        message: 'Device deleted successfully',
        isSuccess: true,
      });
    } catch (error: unknown) {
      return next(error);
    }
  },
);

export default route;
