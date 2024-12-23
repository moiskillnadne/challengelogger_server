import express, { NextFunction, Request, Response } from 'express';

import { UserCrud } from './user.crud';
import { UpdateUserLogoSchema } from './validation.schema';

import { ErrorMessages } from '~/core/dictionary/error.messages';
import { UnauthorizedError, UnprocessableEntityError } from '~/core/errors';
import { isAuthenticated } from '~/shared/user';

const route = express.Router();

/**
 * @swagger
 * /api/protected/user/:
 *   get:
 *     summary: Fetch the authenticated user's details
 *     tags: [User]
 *     security:
 *       - bearerAuth: []  # Indicates that authentication is required
 *     responses:
 *       200:
 *         description: User details successfully fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: USER_FETCHED
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: User fetched successfully
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 details:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       description: The authenticated user's details
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "user-id"
 *                         email:
 *                           type: string
 *                           example: "user@example.com"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         logo:
 *                           type: string
 *                           example: "Base64"
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
route.get('/', (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  if (!isAuthenticated(user)) {
    return next(new UnauthorizedError(ErrorMessages.unauthorized));
  }

  return res.status(200).json({
    type: 'USER_FETCHED',
    statusCode: 200,
    message: 'User fetched successfully',
    isSuccess: true,
    details: {
      user,
    },
  });
});

/**
 * @swagger
 * /api/protected/user/logo:
 *   post:
 *     summary: Update or create a user logo for current user
 *     tags: [User logo]
 *     security:
 *       - bearerAuth: []  # Indicates that authentication is required
 *     requestBody:
 *       required: true
 *       description: User logo base64 image
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *                 description: Base64 string of user logo
 *                 example: "base64-image"
 *     responses:
 *       200:
 *         description: User logo updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: USER_LOGO_UPDATED
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: User logo updated successfully
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *       422:
 *         description: Unprocessable Entity - Invalid base64
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: UNPROCESSABLE_ENTITY_ERROR
 *                 statusCode:
 *                   type: integer
 *                   example: 422
 *                 message:
 *                   type: string
 *                   example: Invalid base64
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
 *                   example: "Unauthorized"
 *        500:
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

route.post('/logo', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;

    if (!isAuthenticated(user)) {
      return next(new UnauthorizedError(ErrorMessages.unauthorized));
    }

    const parsedBody = UpdateUserLogoSchema.safeParse(req.body);

    if (parsedBody.error) {
      throw new UnprocessableEntityError(parsedBody.error.errors[0].message);
    }

    await UserCrud.update({
      logo: parsedBody.data.logo,
      userId: user.id,
    });

    return res.status(201).json({
      type: 'USER_LOGO_UPDATED',
      statusCode: 201,
      message: `User logo updated successfully.`,
      isSuccess: true,
      details: {},
    });
  } catch (error: unknown) {
    return next(error);
  }
});

/**
 * @swagger
 * /api/protected/user/logo:
 *   delete:
 *     summary: Delete a user logo for current user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []  # Indicates that authentication is required
 *     responses:
 *       200:
 *         description: User logo successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: USER_LOGO_DELETED
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: User logo deleted successfully
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
 *                   example: "Unauthorized"
 *        500:
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
  '/logo',
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!isAuthenticated(user)) {
      return next(new UnauthorizedError(ErrorMessages.unauthorized));
    }

    try {
      await UserCrud.delete({
        userId: user.id,
      });

      return res.status(200).json({
        type: 'USER_LOGO_DELETED',
        statusCode: 200,
        message: 'User logo deleted successfully',
        isSuccess: true,
      });
    } catch (error: unknown) {
      return next(error);
    }
  },
);

export default route;
