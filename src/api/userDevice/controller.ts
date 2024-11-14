import express, { NextFunction, Request, Response } from 'express';

import { UserDeviceCrud } from '~/api/userDevice/device.crud';
import { CreateDeviceSchema } from '~/api/userDevice/validation.schema';
import { ErrorMessages } from '~/core/dictionary/error.messages';
import { UnauthorizedError, UnprocessableEntityError } from '~/core/errors';
import { logger } from '~/core/logger';
import { authMiddleware } from '~/core/middleware/auth';
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

      await UserDeviceCrud.saveCredential({
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

export default route;
