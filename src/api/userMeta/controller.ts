import express, { NextFunction, Request, Response } from 'express';

import { UserMeta, UserMetaCrud, UserMetaResult } from './meta.crud';
import { ErrorMessages } from '~/core/dictionary/error.messages';
import { UnauthorizedError, UnprocessableEntityError } from '~/core/errors';
import { logger } from '~/core/logger';
import { authMiddleware } from '~/core/middleware/auth';
import { modelToPlain } from '~/core/utils';
import { isAuthenticated } from '~/shared/user';
import { CreateMetaSchema } from './validation.schema';

const route = express.Router();

route.post(
  '/save-user-meta',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!isAuthenticated(user)) {
      return next(new UnauthorizedError(ErrorMessages.unauthorized));
    }
    try {
      logger.info(`[${req.traceId}] Body: ${JSON.stringify(req.body)}`);

      const validationResult = CreateMetaSchema.safeParse(req.body);

      if (!validationResult.success) {
        throw new UnprocessableEntityError(
          validationResult.error.errors[0].message,
        );
      }

      const userMeta = req.body;

      await UserMetaCrud.saveMeta({
        userId: user.id,
        isWelcomeFlowPassed: userMeta.isWelcomeFlowPassed,
      });

      return res.status(200).json({ success: true });
    } catch (error: unknown) {
      logger.error(`Error saving user meta: ${error}`);
      return res.status(404).json({ isSuccess: false, error });
    }
  },
);

route.get(
  '/',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!isAuthenticated(user)) {
      return next(new UnauthorizedError(ErrorMessages.unauthorized));
    }

    logger.info(`[${req.traceId}] Get user meta started by: ${user.email}`);

    const userMetaEntities = await UserMetaCrud.getMetaByUserId(user.id);

    const userMeta = modelToPlain<Array<UserMeta>>(userMetaEntities);

    const userMetaResult: UserMetaResult[] = userMeta.map((meta) => ({
      id: meta.id,
      createdAt: meta.createdAt,
      updatedAt: meta.updatedAt,
      isWelcomeFlowPassed: meta.isWelcomeFlowPassed,
    }));

    res.status(200).json(userMetaResult);
  },
);

export default route;
