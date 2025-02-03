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
