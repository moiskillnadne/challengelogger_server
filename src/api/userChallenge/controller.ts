import express, { NextFunction, Request, Response } from 'express';

import { UserChallengeCrud } from './challenge.crud';
import { UserChallengeProgressCrud } from './challengeProgress.crud';
import {
  ChallengeStatusFilterSchema,
  CreateChallengeProgressSchema,
  CreateChallengeSchema,
} from './validation.schema';

import { ErrorMessages } from '~/core/dictionary/error.messages';
import {
  NotFoundError,
  UnauthorizedError,
  UnprocessableEntityError,
} from '~/core/errors';
import { PaginationParamsSchema } from '~/core/utils';
import { isAuthenticated } from '~/shared/user';
import { ChallengeStatus } from '~/shared/userChallenge';

const route = express.Router();

/**
 * @swagger
 * /api/protected/challenge/:
 *   get:
 *     summary: Fetch the list of challenges for the authenticated user
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []  # Indicates that authentication is required
 *     responses:
 *       200:
 *         description: Successfully fetched the list of challenges
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: CHALLENGE_LIST_FETCHED
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Challenge list fetched successfully
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 details:
 *                   type: object
 *                   properties:
 *                     challenges:
 *                       type: array
 *                       description: List of challenges
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "challenge-id"
 *                           title:
 *                             type: string
 *                             example: "Complete 5k run"
 *                           description:
 *                             type: string
 *                             example: "A challenge to complete a 5-kilometer run"
 *                           status:
 *                             type: string
 *                             example: "active"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-01-01T12:00:00Z"
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
route.get('/', async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  if (!isAuthenticated(user)) {
    return next(new UnauthorizedError(ErrorMessages.unauthorized));
  }

  const { status = ChallengeStatus.ACTIVE, page = 1, limit = 20 } = req.query;

  const parsedPagination = PaginationParamsSchema.safeParse({ page, limit });

  if (parsedPagination.error) {
    throw new UnprocessableEntityError(
      parsedPagination.error.errors[0].message,
    );
  }

  const parsedFilter = ChallengeStatusFilterSchema.safeParse(status);

  if (parsedFilter.error) {
    throw new UnprocessableEntityError(parsedFilter.error.errors[0].message);
  }

  try {
    const { data, pagination } = await UserChallengeCrud.findMany({
      whereClause: {
        userId: user.id,
        status: parsedFilter.data,
      },
      paginationParams: {
        page: parsedPagination.data?.page,
        limit: parsedPagination.data?.limit,
      },
    });

    return res.status(200).json({
      type: 'CHALLENGE_LIST_FETCHED',
      statusCode: 200,
      message: 'Challenge list fetched successfully',
      isSuccess: true,
      details: {
        data,
        meta: pagination,
      },
    });
  } catch (error: unknown) {
    return next(error);
  }
});

/**
 * @swagger
 * /api/protected/challenge/{challengeId}:
 *   get:
 *     summary: Fetch details of a specific challenge by its ID
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []  # Indicates that authentication is required
 *     parameters:
 *       - in: path
 *         name: challengeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the challenge
 *     responses:
 *       200:
 *         description: Successfully fetched the challenge details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: CHALLENGE_FETCHED
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Challenge fetched successfully
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 details:
 *                   type: object
 *                   properties:
 *                     challenge:
 *                       type: object
 *                       description: The challenge details
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "challenge-id"
 *                         title:
 *                           type: string
 *                           example: "Complete 5k run"
 *                         description:
 *                           type: string
 *                           example: "A challenge to complete a 5-kilometer run"
 *                         status:
 *                           type: string
 *                           example: "active"
 *                         progress:
 *                           type: integer
 *                           description: Progress percentage
 *                           example: 50
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-01-01T12:00:00Z"
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
 *         description: Challenge not found
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
 *                   example: A challenge with such parameters was not found
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
  '/:challengeId',
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!isAuthenticated(user)) {
      return next(new UnauthorizedError(ErrorMessages.unauthorized));
    }

    const { challengeId } = req.params;

    try {
      const dbresult = await UserChallengeCrud.findOneByParamsWithProgress({
        id: challengeId,
        userId: user.id,
      });

      if (!dbresult) {
        throw new NotFoundError(
          'A challenge with such parameters was not found',
        );
      }

      const entity = dbresult.toJSON();

      return res.status(200).json({
        type: 'CHALLENGE_FETCHED',
        statusCode: 200,
        message: 'Challenge fetched successfully',
        isSuccess: true,
        details: {
          challenge: entity,
        },
      });
    } catch (error: unknown) {
      return next(error);
    }
  },
);

/**
 * @swagger
 * /api/protected/challenge/{challengeId}:
 *   delete:
 *     summary: Delete a specific challenge by its ID
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []  # Indicates that authentication is required
 *     parameters:
 *       - in: path
 *         name: challengeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the challenge to be deleted
 *     responses:
 *       200:
 *         description: Challenge successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: CHALLENGE_DELETED
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Challenge deleted successfully
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
 *         description: Challenge not found for the given ID
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
 *                   example: Challenge not found
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
  '/:challengeId',
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!isAuthenticated(user)) {
      return next(new UnauthorizedError(ErrorMessages.unauthorized));
    }

    const challengeId = req.params.challengeId;

    try {
      const deleteResult = await UserChallengeCrud.deleteOneByParams({
        id: challengeId,
        userId: user.id,
      });

      if (deleteResult === 0) {
        throw new NotFoundError('Challenge not found');
      }

      return res.status(200).json({
        type: 'CHALLENGE_DELETED',
        statusCode: 200,
        message: 'Challenge deleted successfully',
        isSuccess: true,
      });
    } catch (error: unknown) {
      return next(error);
    }
  },
);

/**
 * @swagger
 * /api/protected/challenge/create:
 *   post:
 *     summary: Create a new challenge for the authenticated user
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []  # Indicates that authentication is required
 *     requestBody:
 *       required: true
 *       description: The data required to create a new challenge
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string // This is a enum type ["SPORT", "LANGUAGE", "SUGAR", "WATER", "SLEEP", "OTHER"]
 *                 description: The type of the challenge
 *                 example: "SPORT"
 *               title:
 *                 type: string
 *                 description: The title of the challenge
 *                 example: "Complete 5k run"
 *               description:
 *                 type: string
 *                 description: A brief description of the challenge
 *                 example: "A challenge to complete a 5-kilometer run"
 *               status:
 *                 type: string
 *                 description: The status of the challenge
 *                 enum: [active, completed, pending]
 *                 example: "active"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: The start date of the challenge
 *                 example: "2024-01-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: The end date of the challenge
 *                 example: "2024-02-01"
 *     responses:
 *       201:
 *         description: Challenge successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: CHALLENGE_CREATED
 *                 statusCode:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Challenge created successfully
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 details:
 *                   type: object
 *                   properties:
 *                     challenge:
 *                       type: object
 *                       description: The details of the created challenge
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "challenge-id"
 *                         title:
 *                           type: string
 *                           example: "Complete 5k run"
 *                         description:
 *                           type: string
 *                           example: "A challenge to complete a 5-kilometer run"
 *                         status:
 *                           type: string
 *                           example: "active"
 *                         startDate:
 *                           type: string
 *                           format: date
 *                           example: "2024-01-01"
 *                         endDate:
 *                           type: string
 *                           format: date
 *                           example: "2024-02-01"
 *                         userId:
 *                           type: string
 *                           example: "user-id"
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
  '/create',
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!isAuthenticated(user)) {
      return next(new UnauthorizedError(ErrorMessages.unauthorized));
    }

    try {
      const parsedBody = CreateChallengeSchema.safeParse(req.body);

      if (parsedBody.error) {
        throw new UnprocessableEntityError(parsedBody.error.errors[0].message);
      }

      const dbresult = await UserChallengeCrud.create({
        ...parsedBody.data,
        userId: user.id,
      });

      const createdEntity = dbresult.toJSON();

      return res.status(201).json({
        type: 'CHALLENGE_CREATED',
        statusCode: 201,
        message: 'Challenge created successfully',
        isSuccess: true,
        details: {
          challenge: createdEntity,
        },
      });
    } catch (error: unknown) {
      return next(error);
    }
  },
);

/**
 * @swagger
 * /api/protected/challenge/check-in:
 *   post:
 *     summary: Log progress for a challenge
 *     tags: [Challenges]
 *     requestBody:
 *       required: true
 *       description: Data to log progress for a challenge
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               challengeId:
 *                 type: string
 *                 description: The ID of the challenge
 *                 example: "challenge-id"
 *               checkpointDate:
 *                 type: string
 *                 format: date
 *                 description: The date of the progress checkpoint
 *                 example: "2024-01-15"
 *               progress:
 *                 type: integer
 *                 description: The progress value to log
 *                 example: 25
 *     responses:
 *       201:
 *         description: Challenge progress successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: CHALLENGE_PROGRESS_CREATED
 *                 statusCode:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: "Challenge progress created successfully. Current checkpoint date is 2024-01-15"
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 details:
 *                   type: object
 *                   properties:
 *                     challenge:
 *                       type: object
 *                       description: The details of the created progress log
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "progress-id"
 *                         challengeId:
 *                           type: string
 *                           example: "challenge-id"
 *                         checkpointDate:
 *                           type: string
 *                           format: date
 *                           example: "2024-01-15"
 *                         progress:
 *                           type: integer
 *                           example: 25
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-01-15T12:00:00Z"
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
  '/check-in',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedBody = CreateChallengeProgressSchema.safeParse(req.body);

      if (parsedBody.error) {
        throw new UnprocessableEntityError(parsedBody.error.errors[0].message);
      }

      const dbresult = await UserChallengeProgressCrud.create(parsedBody.data);

      const createdEntity = dbresult.toJSON();

      return res.status(201).json({
        type: 'CHALLENGE_PROGRESS_CREATED',
        statusCode: 201,
        message: `Challenge progress created successfully. Current checkpoint date is ${parsedBody.data.checkpointDate}`,
        isSuccess: true,
        details: {
          challenge: createdEntity,
        },
      });
    } catch (error: unknown) {
      return next(error);
    }
  },
);

/**
 * @swagger
 * /api/protected/challenge/check-in/{progressId}:
 *   delete:
 *     summary: Delete a specific progress log by its ID
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []  # Indicates that authentication is required
 *     parameters:
 *       - in: path
 *         name: progressId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the progress log to be deleted
 *     responses:
 *       200:
 *         description: Progress successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: PROGRESS_DELETED
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Progress deleted successfully
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized - User is not authenticated or not the owner of the challenge
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
 *                   example: "You are not the owner of the challenge."
 *       404:
 *         description: Progress not found for the given ID
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
 *                   example: "Progress not found. Progress id: {progressId}"
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
  '/check-in/:progressId',
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!isAuthenticated(user)) {
      return next(new UnauthorizedError(ErrorMessages.unauthorized));
    }

    const progressId = req.params.progressId;

    try {
      // Find progress by id and join the challenge entity
      const dbresult =
        await UserChallengeProgressCrud.findByIdJoinChallenge(progressId);

      if (!dbresult) {
        throw new NotFoundError(
          `Progress not found. Progress id: ${progressId}`,
        );
      }

      const challengeOwnerId = dbresult?.dataValues.userChallenge.userId;

      if (challengeOwnerId !== user.id) {
        throw new UnauthorizedError('You are not the owner of the challenge.');
      }

      const deleteResult =
        await UserChallengeProgressCrud.deleteOne(progressId);

      if (deleteResult === 0) {
        throw new NotFoundError('Progress not found');
      }

      return res.status(200).json({
        type: 'PROGRESS_DELETED',
        statusCode: 200,
        message: 'Progress deleted successfully',
        isSuccess: true,
      });
    } catch (error: unknown) {
      return next(error);
    }
  },
);

/**
 * @swagger
 * /api/protected/challenge/progress/{challengeId}:
 *   get:
 *     summary: Fetch progress logs for a specific challenge
 *     tags: [Challenges]
 *     parameters:
 *       - in: path
 *         name: challengeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the challenge
 *     responses:
 *       200:
 *         description: Successfully fetched progress logs for the challenge
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: CHALLENGE_PROGRESS_FETCHED
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Challenge progress fetched successfully
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 details:
 *                   type: object
 *                   properties:
 *                     challengeProgress:
 *                       type: array
 *                       description: List of progress logs for the challenge
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "progress-id"
 *                           challengeId:
 *                             type: string
 *                             example: "challenge-id"
 *                           checkpointDate:
 *                             type: string
 *                             format: date
 *                             example: "2024-01-15"
 *                           progress:
 *                             type: integer
 *                             example: 25
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-01-15T12:00:00Z"
 *       404:
 *         description: Challenge progress not found for the given ID
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
 *                   example: "Challenge progress not found"
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
  '/progress/:challengeId',
  async (req: Request, res: Response, next: NextFunction) => {
    const { challengeId } = req.params;

    try {
      const dbresult = await UserChallengeProgressCrud.findByChallengeId({
        challengeId: challengeId,
      });

      return res.status(200).json({
        type: 'CHALLENGE_PROGRESS_FETCHED',
        statusCode: 200,
        message: 'Challenge progress fetched successfully',
        isSuccess: true,
        details: {
          challengeProgress: dbresult,
        },
      });
    } catch (error: unknown) {
      return next(error);
    }
  },
);

export default route;
