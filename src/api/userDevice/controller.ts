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

/**
 * @swagger
 * /api/protected/userDevice/save-device-meta:
 *   post:
 *     summary: Save user device metadata
 *     tags: [User Device]
 *     security:
 *       - bearerAuth: []  # Indicates that authentication is required
 *     requestBody:
 *       required: true
 *       description: Metadata of the user's device
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fingerprint:
 *                 type: string
 *                 description: Unique fingerprint of the device
 *                 example: "unique-device-fingerprint"
 *               platform:
 *                 type: string
 *                 description: Operating system of the device
 *                 example: "Windows"
 *               platformVersion:
 *                 type: string
 *                 description: Version of the operating system
 *                 example: "10.0.0"
 *               browser:
 *                 type: string
 *                 description: Browser used on the device
 *                 example: "Chrome"
 *               browserVersion:
 *                 type: string
 *                 description: Version of the browser
 *                 example: "108.0.0"
 *               screenResolution:
 *                 type: string
 *                 description: Screen resolution of the device
 *                 example: "1920x1080"
 *               colorDepth:
 *                 type: integer
 *                 description: Color depth of the device screen
 *                 example: 24
 *               pixelDepth:
 *                 type: integer
 *                 description: Pixel depth of the device screen
 *                 example: 24
 *               webGLFingerprint:
 *                 type: string
 *                 description: WebGL fingerprint of the device
 *                 example: "webgl-fingerprint-example"
 *               pixelRatio:
 *                 type: number
 *                 description: Device pixel ratio
 *                 example: 2
 *               maxTouchPoints:
 *                 type: integer
 *                 description: Maximum touch points supported by the device
 *                 example: 10
 *               isTouchScreen:
 *                 type: boolean
 *                 description: Indicates if the device is a touchscreen
 *                 example: true
 *               canvasFingerprint:
 *                 type: string
 *                 description: Canvas fingerprint of the device
 *                 example: "canvas-fingerprint-example"
 *               userAgent:
 *                 type: string
 *                 description: User agent string of the browser
 *                 example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
 *     responses:
 *       200:
 *         description: Device metadata successfully saved
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

/**
 * @swagger
 * /api/protected/userDevice/:
 *   get:
 *     summary: Retrieve a list of devices associated with the authenticated user
 *     tags: [User Device]
 *     security:
 *       - bearerAuth: []  # Indicates that authentication is required
 *     responses:
 *       200:
 *         description: Successfully fetched the list of user devices
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Unique identifier for the device
 *                     example: "device-id"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: The timestamp when the device was created
 *                     example: "2024-01-01T12:00:00Z"
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     description: The timestamp when the device was last updated
 *                     example: "2024-01-02T12:00:00Z"
 *                   platform:
 *                     type: string
 *                     description: Operating system of the device
 *                     example: "Windows"
 *                   platformVersion:
 *                     type: string
 *                     description: Version of the operating system
 *                     example: "10.0.0"
 *                   browser:
 *                     type: string
 *                     description: Browser used on the device
 *                     example: "Chrome"
 *                   browserVersion:
 *                     type: string
 *                     description: Version of the browser
 *                     example: "108.0.0"
 *                   screenResolution:
 *                     type: string
 *                     description: Screen resolution of the device
 *                     example: "1920x1080"
 *                   colorDepth:
 *                     type: integer
 *                     description: Color depth of the device screen
 *                     example: 24
 *                   pixelDepth:
 *                     type: integer
 *                     description: Pixel depth of the device screen
 *                     example: 24
 *                   webGLFingerprint:
 *                     type: string
 *                     description: WebGL fingerprint of the device
 *                     example: "webgl-fingerprint-example"
 *                   pixelRatio:
 *                     type: number
 *                     description: Device pixel ratio
 *                     example: 2
 *                   maxTouchPoints:
 *                     type: integer
 *                     description: Maximum touch points supported by the device
 *                     example: 10
 *                   isTouchScreen:
 *                     type: boolean
 *                     description: Indicates if the device is a touchscreen
 *                     example: true
 *                   userAgent:
 *                     type: string
 *                     description: User agent string of the browser
 *                     example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
 *                   userId:
 *                     type: string
 *                     description: ID of the user associated with the device
 *                     example: "user-id"
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

/**
 * @swagger
 * /api/protected/userDevice/{deviceId}:
 *   delete:
 *     summary: Delete a specific device by its ID
 *     tags: [User Device]
 *     security:
 *       - bearerAuth: []  # Indicates that authentication is required
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the device to be deleted
 *     responses:
 *       200:
 *         description: Device successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: DEVICE_DELETED
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Device deleted successfully
 *                 isSuccess:
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
 *       404:
 *         description: Device not found for the given ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: NOT_FOUND
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: Device not found
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
