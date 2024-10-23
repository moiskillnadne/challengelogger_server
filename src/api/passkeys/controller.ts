import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  GenerateRegistrationOptionsOpts,
  verifyAuthenticationResponse,
  VerifyAuthenticationResponseOpts,
  verifyRegistrationResponse,
  VerifyRegistrationResponseOpts,
} from '@simplewebauthn/server';
import { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/server/script/deps';
import express, { NextFunction, Request, Response } from 'express';

import { Passkey } from './types';
import { redis } from '../../redis';
import { mapToChallengeKey } from '../../redis/mappers';
import { LoginBodySchema } from '../auth/validation.schema';

import { ONE_MINUTE, rpID, rpName } from '~/core/constants';
import { origin } from '~/core/constants';
import { ErrorMessages } from '~/core/dictionary/error.messages';
import { BadRequestError, UnauthorizedError } from '~/core/errors';
import { logger } from '~/core/logger';
import { authMiddleware } from '~/core/middleware/auth';
import { modelToPlain } from '~/core/utils';
import { isAuthenticated, UserCrudService } from '~/shared/user';
import { UserCredentialCrudService } from '~/shared/UserCredential';

const route = express.Router();

route.post(
  '/generate-registration-options',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!isAuthenticated(user)) {
      return next(new UnauthorizedError(ErrorMessages.unauthorized));
    }

    logger.info(
      `[${req.traceId}] Generate registration options started by: ${user.email}`,
    );

    const userCredentialEntities =
      await UserCredentialCrudService.getCredentialByUserId(user.id);

    const userCredentials = modelToPlain<Array<Passkey>>(
      userCredentialEntities,
    );

    const opts: GenerateRegistrationOptionsOpts = {
      rpName,
      rpID,
      userName: user.email,
      timeout: 60000,
      attestationType: 'none',
      excludeCredentials: userCredentials.map((passkey) => ({
        id: passkey.credId,
        transports: passkey.transports,
      })),
      authenticatorSelection: {
        residentKey: 'discouraged',
        userVerification: 'preferred',
      },
      supportedAlgorithmIDs: [-7, -257],
    };

    const options = await generateRegistrationOptions(opts);

    logger.info(
      `[${req.traceId}] Generated challenge options: ${JSON.stringify(options)}`,
    );

    await redis.set(mapToChallengeKey(user.email), options.challenge, {
      EX: ONE_MINUTE * 15,
    });

    res.status(200).json(options);
  },
);

route.post(
  '/verify-registration',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!isAuthenticated(user)) {
      return next(new UnauthorizedError(ErrorMessages.unauthorized));
    }

    const expectedChallenge = await redis.get(mapToChallengeKey(user.email));

    if (!expectedChallenge) {
      return res.status(400).json({ error: 'Expected challenge not found' });
    }

    try {
      logger.info(`[${req.traceId}] Body: ${JSON.stringify(req.body)}`);

      logger.info(
        `[${req.traceId}] Challenge: ${JSON.stringify(expectedChallenge)}`,
      );

      logger.info(`[${req.traceId}] Expected origin: ${origin}`);

      const opts: VerifyRegistrationResponseOpts = {
        response: req.body,
        expectedChallenge: `${expectedChallenge}`,
        expectedOrigin: origin,
        expectedRPID: rpID,
        requireUserVerification: false,
      };

      const verification = await verifyRegistrationResponse(opts);

      const { verified, registrationInfo } = verification;

      if (!verified) {
        logger.warn(
          `[${req.traceId}] Registration verifications failed for user: ${user.email}.`,
        );
        return res
          .status(401)
          .json({ success: false, message: 'Verification failed' });
      }

      if (!registrationInfo) {
        logger.warn(
          `[${req.traceId}] Registration info not found for user: ${user.email}.`,
        );
        return res
          .status(401)
          .json({ success: false, message: 'Registration info not found' });
      }

      logger.info(
        `[${req.traceId}] Registration verified for user: ${user.email}. Saving into DB`,
      );

      const userCredEntities =
        await UserCredentialCrudService.getCredentialByUserId(user.id);

      const userCredentials = modelToPlain<Array<Passkey>>(userCredEntities);

      const existingCredential = userCredentials.find(
        (cred) => cred.id === registrationInfo.credential.id,
      );

      if (!existingCredential) {
        await UserCredentialCrudService.saveCredential({
          userId: user.id,
          webauthnUserID: user.id,
          credId: registrationInfo.credential.id,
          publicKey: registrationInfo.credential.publicKey,
          deviceType: registrationInfo.credentialDeviceType,
          backedUp: registrationInfo.credentialBackedUp,
          counter: registrationInfo.credential.counter,
          transports: registrationInfo.credential.transports,
        });
      }

      await redis.del(mapToChallengeKey(user.email));

      return res.status(200).json({ success: true, verified });
    } catch (error: unknown) {
      logger.error(`Error verifying registration: ${error}`);
      return res.status(404).json({ isSuccess: false, error });
    }
  },
);

route.post(
  '/login',
  async (req: Request, res: Response, next: NextFunction) => {
    const safeParse = LoginBodySchema.safeParse(req.body);

    if (safeParse.error) {
      return next(new BadRequestError(safeParse.error.errors[0].message));
    }

    const { email } = safeParse.data;

    logger.info(`User with email "${email}" is trying to login`);

    const user = await UserCrudService.getUserByEmailWithCredentials(email);

    if (!user) {
      return next(new UnauthorizedError(ErrorMessages.unauthorized));
    }

    try {
      const userCredentials = (user.dataValues.credentials?.map((entity: any) =>
        entity.get({ plain: true }),
      ) ?? []) as unknown as Array<Passkey>;

      const options = await generateAuthenticationOptions({
        rpID,
        allowCredentials: userCredentials.map((passkey: Passkey) => ({
          id: passkey.credId,
          transports: passkey.transports,
        })),
      });

      const optionsJSON = JSON.stringify(options);

      logger.info(`Authentication challenge options: ${optionsJSON}`);

      await redis.set(mapToChallengeKey(email), optionsJSON, {
        EX: ONE_MINUTE * 15,
      });

      res.status(200).json({ success: true, data: options });
    } catch (error: unknown) {
      logger.error(`Error generating challenge: ${error}`);
      return next(error);
    }
  },
);

route.post(
  '/verify-login',
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, challengeResponse } = req.body;

    logger.info(
      `User with email "${email}" is trying to verify login challenge`,
    );

    if (!email) {
      return next(new BadRequestError('Email is required'));
    }

    const user = await UserCrudService.getUserByEmailWithCredentials(email);

    logger.info(`User found: ${user?.dataValues.email}`);

    if (!user) {
      return next(new UnauthorizedError(ErrorMessages.unauthorized));
    }

    const userChallengeOptions = await redis
      .get(mapToChallengeKey(email))
      .then<PublicKeyCredentialCreationOptionsJSON | null>((data) =>
        data ? JSON.parse(data) : null,
      );

    logger.info(
      `Challenge from redis: ${JSON.stringify(userChallengeOptions)}`,
    );

    if (!userChallengeOptions) {
      return next(new BadRequestError('Challenge not found'));
    }

    const userCredentials = (user.dataValues.credentials?.map((entity: any) =>
      entity.get({ plain: true }),
    ) ?? []) as unknown as Array<Passkey>;

    const passkey = userCredentials.find(
      (passkey) => passkey.credId === challengeResponse.id,
    );

    if (!passkey) {
      return next(new BadRequestError('Passkey not found'));
    }

    logger.info(`Found passkey: ${JSON.stringify(passkey)}`);

    try {
      const verifyChallengeOptions: VerifyAuthenticationResponseOpts = {
        response: challengeResponse,
        expectedChallenge: userChallengeOptions.challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        credential: {
          id: passkey.credId,
          publicKey: passkey.publicKey,
          counter: passkey.counter,
          transports: passkey.transports,
        },
        requireUserVerification: false,
      };

      logger.info(
        `Verify challenge options: ${JSON.stringify(verifyChallengeOptions)}`,
      );

      const verification = await verifyAuthenticationResponse(
        verifyChallengeOptions,
      );

      logger.info(`Verification result: ${JSON.stringify(verification)}`);

      if (verification.verified) {
        await redis.del(mapToChallengeKey(email));

        const updatedCounter = verification.authenticationInfo.newCounter;

        await UserCredentialCrudService.updateCredentialCounter({
          credId: passkey.credId,
          counter: updatedCounter,
        });

        return res.status(200).json({ success: true });
      }

      return res.status(401).json({ success: false });
    } catch (error: unknown) {
      return next(error);
    }
  },
);

export default route;
