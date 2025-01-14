import express, { NextFunction, Request, Response } from 'express';

import {
  CounterCrudService,
  CreateCounterSchema,
} from '~/api/counter/counter.crud';
import { ErrorMessages } from '~/core/dictionary/error.messages';
import {
  NotFoundError,
  UnauthorizedError,
  UnprocessableEntityError,
} from '~/core/errors';
import { isAuthenticated } from '~/shared/user';

const route = express.Router();

/**
 * @swagger
 * /create:
 *   post:
 *     summary: Create a new counter
 *     description: This endpoint creates a new counter for an authenticated user.
 *     tags:
 *       - Counters
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the counter
 *                 example: My Counter
 *               value:
 *                 type: number
 *                 description: The initial value of the counter
 *                 example: 10
 *             required:
 *               - name
 *               - value
 *     responses:
 *       201:
 *         description: Counter created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: COUNTER_CREATED
 *                 statusCode:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Counter created successfully
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 details:
 *                   type: object
 *                   properties:
 *                     counter:
 *                       type: object
 *                       description: Details of the created counter
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       422:
 *         description: Unprocessable Entity
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid input data
 */
route.post(
  '/create',
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!isAuthenticated(user)) {
      return next(new UnauthorizedError(ErrorMessages.unauthorized));
    }

    try {
      const parsed = CreateCounterSchema.safeParse(req.body);

      if (parsed.error) {
        throw new UnprocessableEntityError(parsed.error.errors[0].message);
      }

      const dbresult = await CounterCrudService.create({
        ...parsed.data,
        userId: user.id,
      });

      const createdEntity = dbresult.toJSON();

      return res.status(201).json({
        type: 'COUNTER_CREATED',
        statusCode: 201,
        message: 'Counter created successfully',
        isSuccess: true,
        details: {
          counter: createdEntity,
        },
      });
    } catch (error) {
      console.error(error);
      return next(error);
    }
  },
);

/**
 * @swagger
 * /{counterId}:
 *   get:
 *     summary: Get a counter by ID
 *     description: Fetches a specific counter by its ID for an authenticated user.
 *     tags:
 *       - Counters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: counterId
 *         required: true
 *         description: The ID of the counter to fetch
 *         schema:
 *           type: string
 *           example: 12345
 *     responses:
 *       200:
 *         description: Counter fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: COUNTER_FETCHED
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Counter fetched successfully
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 details:
 *                   type: object
 *                   properties:
 *                     counter:
 *                       type: object
 *                       description: Details of the fetched counter
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       404:
 *         description: Counter not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: A counter with such parameters was not found
 */
route.get(
  '/:counterId',
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!isAuthenticated(user)) {
      return next(new UnauthorizedError(ErrorMessages.unauthorized));
    }

    const { counterId } = req.params;

    try {
      const dbresult = await CounterCrudService.getOneById(counterId);

      if (!dbresult) {
        throw new NotFoundError('A counter with such parameters was not found');
      }

      const entity = dbresult.toJSON();

      return res.status(200).json({
        type: 'COUNTER_FETCHED',
        statusCode: 200,
        message: 'Counter fetched successfully',
        isSuccess: true,
        details: {
          counter: entity,
        },
      });
    } catch (error) {
      return next(error);
    }
  },
);

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get a list of counters for the authenticated user
 *     description: Fetches all counters associated with the authenticated user's account.
 *     tags:
 *       - Counters
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Counter list fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: COUNTER_LIST_FETCHED
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Counter list fetched successfully
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 details:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       description: List of counters
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: Unique identifier for the counter
 *                             example: 12345
 *                           name:
 *                             type: string
 *                             description: The name of the counter
 *                             example: My Counter
 *                           value:
 *                             type: number
 *                             description: The value of the counter
 *                             example: 10
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 */
route.get('/', async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  if (!isAuthenticated(user)) {
    return next(new UnauthorizedError(ErrorMessages.unauthorized));
  }

  try {
    const dbresult = await CounterCrudService.getListByUserId(user.id);

    return res.status(200).json({
      type: 'COUNTER_LIST_FETCHED',
      statusCode: 200,
      message: 'Counter list fetched successfully',
      isSuccess: true,
      details: {
        data: dbresult,
      },
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * @swagger
 * /increment/{counterId}:
 *   post:
 *     summary: Increment a counter by ID
 *     description: Increments the value of a specific counter for an authenticated user.
 *     tags:
 *       - Counters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: counterId
 *         required: true
 *         description: The ID of the counter to increment
 *         schema:
 *           type: string
 *           example: 12345
 *     responses:
 *       200:
 *         description: Counter updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: COUNTER_UPDATED
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Counter updated
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 details:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       description: Details of the updated counter
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: The unique ID of the counter
 *                           example: 12345
 *                         value:
 *                           type: number
 *                           description: The updated value of the counter
 *                           example: 11
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       404:
 *         description: Counter not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Counter not found
 */
route.post(
  '/increment/:counterId',
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!isAuthenticated(user)) {
      return next(new UnauthorizedError(ErrorMessages.unauthorized));
    }

    const { counterId } = req.params;

    try {
      const dbresult = await CounterCrudService.incrementCounterById(counterId);

      return res.status(200).json({
        type: 'COUNTER_UPDATED',
        statusCode: 200,
        message: 'Counter updated',
        isSuccess: true,
        details: {
          data: dbresult,
        },
      });
    } catch (error) {
      return next(error);
    }
  },
);

export default route;
