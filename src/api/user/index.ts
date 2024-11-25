import express, { NextFunction, Request, Response } from 'express';

import { ErrorMessages } from '~/core/dictionary/error.messages';
import { UnauthorizedError } from '~/core/errors';
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

export default route;
