import express, { NextFunction, Request, Response } from 'express';

import { UserChallengeCrud } from './challenge.crud';
import { UserChallengeProgressCrud } from './challengeProgress.crud';
import {
  CreateChallengeProgressSchema,
  CreateChallengeSchema,
} from './validation.schema';

import { ErrorMessages } from '~/core/dictionary/error.messages';
import {
  NotFoundError,
  UnauthorizedError,
  UnprocessableEntityError,
} from '~/core/errors';
import { authMiddleware } from '~/core/middleware/auth';
import { isAuthenticated } from '~/shared/user';

const route = express.Router();

route.use(authMiddleware);

route.get('/', async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  if (!isAuthenticated(user)) {
    return next(new UnauthorizedError(ErrorMessages.unauthorized));
  }

  try {
    const dbresult = await UserChallengeCrud.findManyByUserId(user.id);

    return res.status(200).json({
      type: 'CHALLENGE_LIST_FETCHED',
      statusCode: 200,
      message: 'Challenge list fetched successfully',
      isSuccess: true,
      details: {
        challenges: dbresult,
      },
    });
  } catch (error: unknown) {
    return next(error);
  }
});

route.get(
  '/:challengeId',
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!isAuthenticated(user)) {
      return next(new UnauthorizedError(ErrorMessages.unauthorized));
    }

    const { challengeId } = req.params;

    try {
      const dbresult = await UserChallengeCrud.findOneByParams({
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
