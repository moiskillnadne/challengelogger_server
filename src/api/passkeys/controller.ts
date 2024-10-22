import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  VerifyAuthenticationResponseOpts,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/server/script/deps';
import express, { NextFunction, Request, Response } from 'express';

import { Passkey } from './types';
import { ONE_MINUTE, rpID, rpName } from '../../core/constants';
import { redis } from '../../redis';
import { mapToChallengeKey } from '../../redis/mappers';
import { UserCredentialCrudService } from '../../shared/UserCredential';
import { LoginBodySchema } from '../auth/validation.schema';

import { origin } from '~/core/constants';
import { ErrorMessages } from '~/core/dictionary/error.messages';
import { BadRequestError, UnauthorizedError } from '~/core/errors';
import { logger } from '~/core/logger';
import { authMiddleware } from '~/core/middleware/auth';
import { isAuthenticated, UserCrudService } from '~/shared/user';

const route = express.Router();

route.post(
  '/register',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!isAuthenticated(user)) {
      return next(new UnauthorizedError(ErrorMessages.unauthorized));
    }

    logger.info(
      `Credential registration process started for user: ${user.email}`,
    );

    const credentialEntities =
      await UserCredentialCrudService.getCredentialByUserId(user.id);

    const credentials = (credentialEntities?.map((entity) =>
      entity.get({ plain: true }),
    ) ?? []) as unknown as Array<Passkey>;

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userName: user.email,
      attestationType: 'none',
      excludeCredentials: credentials.map((passkey) => ({
        id: passkey.credId,
        transports: passkey.transports,
      })),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform',
      },
    });

    logger.info(`Generated challenge options: ${JSON.stringify(options)}`);

    await redis.set(mapToChallengeKey(user.email), JSON.stringify(options));

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

    const userChallengeOptions = await redis
      .get(mapToChallengeKey(user.email))
      .then<PublicKeyCredentialCreationOptionsJSON | null>((data) =>
        data ? JSON.parse(data) : null,
      );

    if (!userChallengeOptions) {
      return res.status(400).json({ error: 'Challenge not found' });
    }

    try {
      logger.info(`Body: ${JSON.stringify(req.body)}`);

      logger.info(`Challenge: ${JSON.stringify(userChallengeOptions)}`);

      logger.info(`Expected origin: ${origin}`);

      const verification = await verifyRegistrationResponse({
        response: req.body,
        expectedChallenge: userChallengeOptions.challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        requireUserVerification: false,
      });

      if (verification.verified) {
        const { registrationInfo } = verification;

        logger.info(
          `Registration verified for user: ${user.email}. Saving into DB`,
        );

        if (!registrationInfo) {
          return res
            .status(400)
            .json({ error: 'Registration info not provided' });
        }

        await UserCredentialCrudService.saveCredential({
          userId: user.id,
          webauthnUserID: userChallengeOptions.user.id,
          credId: registrationInfo.credential.id,
          publicKey: registrationInfo.credential.publicKey,
          deviceType: registrationInfo.credentialDeviceType,
          backedUp: registrationInfo.credentialBackedUp,
          counter: registrationInfo.credential.counter,
          transports: registrationInfo.credential.transports,
        });

        return res.status(200).json({ success: true, data: registrationInfo });
      }
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
        advancedFIDOConfig: {
          userVerification: 'discouraged',
        },
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
