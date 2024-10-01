import express, { Request, Response } from 'express';
import { ValidationErrorItem } from 'sequelize';

import { UserChallengeCrud } from './crud';
import { CreateChallengeSchema } from './validation.schema';

import { ZodValidationError } from '~/core/errors/ZodValidationError';
import { authMiddleware, AuthorizedRequest } from '~/core/middleware/auth';

const route = express.Router();

route.use(authMiddleware);

route.get('/:challengeId', async (req: Request, res: Response) => {
  const user = (req as AuthorizedRequest).user;
  const { challengeId } = req.params;

  try {
    const dbresult = await UserChallengeCrud.findByIdAndUser({
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
    return new ZodValidationError(parsedBody.error).send(res);
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

export default route;
