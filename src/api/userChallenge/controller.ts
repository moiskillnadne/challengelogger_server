import express, { Request, Response } from 'express';
import { ValidationErrorItem } from 'sequelize';

import { UserChallengeCrud } from './challenge.crud';
import { UserChallengeProgressCrud } from './challengeProgress.crud';
import {
  CreateChallengeProgressSchema,
  CreateChallengeSchema,
} from './validation.schema';

import { ValidationError } from '~/core/errors';
import { authMiddleware, AuthorizedRequest } from '~/core/middleware/auth';

const route = express.Router();

route.use(authMiddleware);

route.get('/', async (req: Request, res: Response) => {
  const user = (req as AuthorizedRequest).user;

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
  } catch (error: any) {
    if (error?.errors?.[0] instanceof ValidationErrorItem) {
      return res.status(400).json({
        isError: true,
        type: 'VALIDATION_ERROR',
        message: error?.errors?.[0].message,
        details: error?.errors?.[0],
      });
    }

    return res.status(500).json({ isError: true });
  }
});

route.get('/:challengeId', async (req: Request, res: Response) => {
  const user = (req as AuthorizedRequest).user;
  const { challengeId } = req.params;

  try {
    const dbresult = await UserChallengeCrud.findOneByParams({
      id: challengeId,
      userId: user.id,
    });

    if (!dbresult) {
      return res.status(404).json({
        isError: true,
        type: 'CHALLENGE_BY_PARAMS_NOT_FOUND',
        message: 'A challenge with such parameters was not found',
      });
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
  } catch (error: any) {
    if (error?.errors?.[0] instanceof ValidationErrorItem) {
      return res.status(400).json({
        isError: true,
        type: 'VALIDATION_ERROR',
        message: error?.errors?.[0].message,
        details: error?.errors?.[0],
      });
    }

    return res.status(500).json({ isError: true });
  }
});

route.post('/create', async (req: Request, res: Response) => {
  const user = (req as AuthorizedRequest).user;

  const parsedBody = CreateChallengeSchema.safeParse(req.body);

  if (parsedBody.error) {
    throw new ValidationError(parsedBody.error.errors[0].message);
  }

  try {
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
  } catch (error: any) {
    if (error?.errors?.[0] instanceof ValidationErrorItem) {
      return res.status(400).json({
        isError: true,
        type: 'VALIDATION_ERROR',
        message: error?.errors?.[0].message,
        details: error?.errors?.[0],
      });
    }

    return res.status(500).json({ isError: true });
  }
});

route.post('/check-in', async (req: Request, res: Response) => {
  const parsedBody = CreateChallengeProgressSchema.safeParse(req.body);

  if (parsedBody.error) {
    throw new ValidationError(parsedBody.error.errors[0].message);
  }

  try {
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
  } catch (error: any) {
    if (error?.errors?.[0] instanceof ValidationErrorItem) {
      return res.status(400).json({
        isError: true,
        type: 'VALIDATION_ERROR',
        message: error?.errors?.[0].message,
        details: error?.errors?.[0],
      });
    }

    return res.status(500).json({ isError: true });
  }
});

route.get('/progress/:challengeId', async (req: Request, res: Response) => {
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
  } catch (error: any) {
    if (error?.errors?.[0] instanceof ValidationErrorItem) {
      return res.status(400).json({
        isError: true,
        type: 'VALIDATION_ERROR',
        message: error?.errors?.[0].message,
        details: error?.errors?.[0],
      });
    }

    return res.status(500).json({ isError: true, details: error });
  }
});

export default route;
