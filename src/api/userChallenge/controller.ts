import express, { Request, Response } from 'express';

import { UserChallengeCrud } from './challenge.crud';
import { UserChallengeProgressCrud } from './challengeProgress.crud';
import {
  CreateChallengeProgressSchema,
  CreateChallengeSchema,
} from './validation.schema';

import { ErrorMessages } from '~/core/dictionary/error.messages';
import { UnauthorizedError } from '~/core/errors/UnauthorizedError';
import { ZodValidationError } from '~/core/errors/ZodValidationError';
import { authMiddleWare } from '~/core/middleware/authorization';

const route = express.Router();

route.use(authMiddleWare);

route.get('/', async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new UnauthorizedError(ErrorMessages.unauthorized);
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
    throw error;
  }
});

route.get('/:challengeId', async (req: Request, res: Response) => {
  const user = req.user;
  const { challengeId } = req.params;

  if (!user) {
    throw new UnauthorizedError(ErrorMessages.unauthorized);
  }

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
  } catch (error: unknown) {
    throw error;
  }
});

route.post('/create', async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new UnauthorizedError(ErrorMessages.unauthorized);
  }

  const parsedBody = CreateChallengeSchema.safeParse(req.body);

  if (parsedBody.error) {
    return new ZodValidationError(parsedBody.error);
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
  } catch (error: unknown) {
    throw error;
  }
});

route.post('/check-in', async (req: Request, res: Response) => {
  const parsedBody = CreateChallengeProgressSchema.safeParse(req.body);

  if (parsedBody.error) {
    return new ZodValidationError(parsedBody.error);
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
  } catch (error: unknown) {
    throw error;
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
  } catch (error: unknown) {
    throw error;
  }
});

export default route;
