import {
  generateAuthenticationOptions,
  GenerateAuthenticationOptionsOpts,
  generateRegistrationOptions,
  GenerateRegistrationOptionsOpts,
  verifyAuthenticationResponse,
  VerifyAuthenticationResponseOpts,
  verifyRegistrationResponse,
  VerifyRegistrationResponseOpts,
} from '@simplewebauthn/server';
import express, { NextFunction, Request, Response } from 'express';

import { Passkey, PasskeyResult, TemporaryChallenge } from './types';
import { CookieTokensService } from '../auth/CookieTokensService';
import { LoginBodySchema } from '../auth/validation.schema';

import { Env, ONE_MINUTE, ONE_MONTH, rpID, rpName } from '~/core/constants';
import { origin } from '~/core/constants';
import { ErrorMessages } from '~/core/dictionary/error.messages';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '~/core/errors';
import { logger } from '~/core/logger';
import { authMiddleware } from '~/core/middleware/auth';
import { jwtService, modelToPlain } from '~/core/utils';
import { redis } from '~/redis';
import { mapToChallengeKey, mapToRefreshTokenKey } from '~/redis/mappers';
import { isAuthenticated, UserCrudService } from '~/shared/user';
import { UserCredentialCrudService } from '~/shared/UserCredential';

const route = express.Router();

/**
 * @swagger
 * /api/protected/passkeys/generate-registration-options:
 *   post:
 *     summary: Generate options for passkey registration
 *     tags: [Passkeys]
 *     security:
 *       - bearerAuth: []  # Indicates that this route requires authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deviceName:
 *                 type: string
 *                 description: The name of the device being registered.
 *                 example: "My iPhone"
 *             required:
 *               - deviceName
 *     responses:
 *       200:
 *         description: Registration options successfully generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rpName:
 *                   type: string
 *                   example: My Application
 *                 rpID:
 *                   type: string
 *                   example: myapp.com
 *                 userName:
 *                   type: string
 *                   example: user@example.com
 *                 timeout:
 *                   type: integer
 *                   example: 60000
 *                 attestationType:
 *                   type: string
 *                   example: none
 *                 excludeCredentials:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Credential ID
 *                       transports:
 *                         type: array
 *                         items:
 *                           type: string
 *                 authenticatorSelection:
 *                   type: object
 *                   properties:
 *                     residentKey:
 *                       type: string
 *                       example: discouraged
 *                     userVerification:
 *                       type: string
 *                       example: preferred
 *                 supportedAlgorithmIDs:
 *                   type: array
 *                   items:
 *                     type: integer
 *                     example: -7
 *                 challenge:
 *                   type: string
 *                   example: "random-base64-encoded-challenge"
 *       400:
 *         description: Bad request. The property "deviceName" is required.
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
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "The property 'deviceName' is required"
 *       401:
 *         description: Unauthorized user
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
route.post(
  '/generate-registration-options',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!isAuthenticated(user)) {
      return next(new UnauthorizedError(ErrorMessages.unauthorized));
    }

    const deviceName: string | null = req.body.deviceName ?? null;

    if (!deviceName) {
      return next(new BadRequestError('The property "deviceName" is required'));
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

    const tempChallenge: TemporaryChallenge = {
      challenge: options.challenge,
      deviceName: deviceName,
    };

    await redis.set(
      mapToChallengeKey(user.email),
      JSON.stringify(tempChallenge),
      {
        EX: ONE_MINUTE * 15,
      },
    );

    res.status(200).json(options);
  },
);

/**
 * @swagger
 * /api/protected/passkeys/verify-registration:
 *   post:
 *     summary: Verify passkey registration response
 *     tags: [Passkeys]
 *     security:
 *       - bearerAuth: []  # Indicates that this route requires authentication
 *     requestBody:
 *       required: true
 *       description: Passkey registration response to verify
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: Credential ID
 *                 example: "cred-id-example"
 *               rawId:
 *                 type: string
 *                 description: Raw ID of the credential
 *                 example: "raw-id-example"
 *               response:
 *                 type: object
 *                 description: Credential response
 *                 properties:
 *                   clientDataJSON:
 *                     type: string
 *                     description: Client data JSON, base64 encoded
 *                     example: "eyJ0eXAiOiJKV1QiLC..."
 *                   attestationObject:
 *                     type: string
 *                     description: Attestation object, base64 encoded
 *                     example: "eyJvcmlnaW4iOiJodHRwczovL2..."
 *               type:
 *                 type: string
 *                 description: The type of credential ("public-key")
 *                 example: "public-key"
 *     responses:
 *       200:
 *         description: Registration successfully verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 verified:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Expected challenge not found or invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Expected challenge not found"
 *       401:
 *         description: Verification failed or registration info missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Verification failed"
 *       404:
 *         description: Error during registration verification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Error message"
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
  '/verify-registration',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!isAuthenticated(user)) {
      return next(new UnauthorizedError(ErrorMessages.unauthorized));
    }

    const expectedChallengeJSON = await redis.get(
      mapToChallengeKey(user.email),
    );

    if (!expectedChallengeJSON) {
      return res.status(400).json({ error: 'Expected challenge not found' });
    }

    try {
      const expectedChallenge: TemporaryChallenge = JSON.parse(
        expectedChallengeJSON,
      );

      logger.info(`[${req.traceId}] Body: ${JSON.stringify(req.body)}`);

      logger.info(
        `[${req.traceId}] Challenge: ${JSON.stringify(expectedChallenge.challenge)}`,
      );

      logger.info(`[${req.traceId}] Expected origin: ${origin}`);

      const opts: VerifyRegistrationResponseOpts = {
        response: req.body,
        expectedChallenge: `${expectedChallenge.challenge}`,
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
        logger.info(
          `[${req.traceId}] Public key: ${registrationInfo.credential.publicKey}`,
        );
        logger.info(
          `[${req.traceId}] Public key length: ${registrationInfo.credential.publicKey.length}`,
        );

        await UserCredentialCrudService.saveCredential({
          userId: user.id,
          webauthnUserID: user.id,
          credId: registrationInfo.credential.id,
          publicKey: registrationInfo.credential.publicKey,
          deviceType: registrationInfo.credentialDeviceType,
          backedUp: registrationInfo.credentialBackedUp,
          counter: registrationInfo.credential.counter,
          transports: registrationInfo.credential.transports,
          deviceName: expectedChallenge.deviceName,
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

/**
 * @swagger
 * /api/protected/passkeys/generate-authentication-options:
 *   post:
 *     summary: Generate options for user authentication
 *     tags: [Passkeys]
 *     requestBody:
 *       required: true
 *       description: Request body containing the user's email
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email of the user attempting to authenticate
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Authentication options successfully generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 options:
 *                   type: object
 *                   properties:
 *                     timeout:
 *                       type: integer
 *                       example: 60000
 *                     allowCredentials:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: Credential ID
 *                             example: "credential-id-example"
 *                           type:
 *                             type: string
 *                             description: Credential type
 *                             example: "public-key"
 *                           transports:
 *                             type: array
 *                             items:
 *                               type: string
 *                               description: Supported transport types
 *                               example: "usb"
 *                     userVerification:
 *                       type: string
 *                       example: "preferred"
 *                     rpID:
 *                       type: string
 *                       description: Relying Party ID
 *                       example: "example.com"
 *                     challenge:
 *                       type: string
 *                       example: "random-challenge-string"
 *       400:
 *         description: Invalid user email or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 challenge:
 *                   type: string
 *                   example: ""
 *                 allowCredentials:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: "SERVER_ERROR"
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
route.post(
  '/generate-authentication-options',
  async (req: Request, res: Response, next: NextFunction) => {
    const safeParse = LoginBodySchema.safeParse(req.body);

    if (safeParse.error) {
      return next(new BadRequestError(safeParse.error.errors[0].message));
    }

    const { email } = safeParse.data;

    logger.info(`User with email "${email}" is trying to login`);

    const user = await UserCrudService.getUserByEmailWithCredentials(email);

    if (!user) {
      return res.status(400).json({
        challenge: '',
        allowCredentials: [],
      });
    }

    try {
      const userCredentials = modelToPlain<Array<Passkey>>(
        user.dataValues.credentials,
      );

      const opt: GenerateAuthenticationOptionsOpts = {
        timeout: 60000,
        allowCredentials: userCredentials.map((passkey: Passkey) => ({
          id: passkey.credId,
          type: 'public-key',
          transports: passkey.transports,
        })),
        userVerification: 'preferred',
        rpID,
      };

      const options = await generateAuthenticationOptions(opt);

      logger.info(`Authentication challenge: ${options.challenge}`);

      await redis.set(mapToChallengeKey(email), options.challenge, {
        EX: ONE_MINUTE * 15,
      });

      res.status(200).json({ success: true, options });
    } catch (error: unknown) {
      logger.error(`Error generating challenge: ${error}`);
      return next(error);
    }
  },
);

/**
 * @swagger
 * /api/protected/passkeys/verify-authentication:
 *   post:
 *     summary: Verify authentication challenge response
 *     tags: [Passkeys]
 *     requestBody:
 *       required: true
 *       description: Request body containing the email and challenge response
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email of the user attempting to authenticate
 *                 example: user@example.com
 *               challengeResponse:
 *                 type: object
 *                 description: The response to the authentication challenge
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The credential ID
 *                     example: "credential-id-example"
 *                   rawId:
 *                     type: string
 *                     description: The raw ID of the credential
 *                     example: "raw-id-example"
 *                   response:
 *                     type: object
 *                     properties:
 *                       authenticatorData:
 *                         type: string
 *                         description: Authenticator data in base64 format
 *                         example: "base64-encoded-authenticator-data"
 *                       clientDataJSON:
 *                         type: string
 *                         description: Client data JSON in base64 format
 *                         example: "base64-encoded-client-data-json"
 *                       signature:
 *                         type: string
 *                         description: The signature of the authentication
 *                         example: "base64-encoded-signature"
 *                       userHandle:
 *                         type: string
 *                         description: Optional user handle
 *                         example: "base64-encoded-user-handle"
 *                   type:
 *                     type: string
 *                     description: The credential type
 *                     example: "public-key"
 *     responses:
 *       200:
 *         description: Authentication successfully verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Missing email, challenge not found, or authenticator not registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Challenge not found"
 *       401:
 *         description: Verification failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: "SERVER_ERROR"
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
route.post(
  '/verify-authentication',
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

    const userCredentials = modelToPlain<Array<Passkey>>(
      user.dataValues.credentials,
    );

    const passkey = userCredentials.find(
      (passkey) => passkey.credId === challengeResponse.id,
    );

    if (!passkey) {
      return next(
        new BadRequestError('Authenticator is not registered with this site'),
      );
    }

    logger.info(`[${req.traceId}] Public key found: ${passkey.publicKey}`);
    logger.info(
      `[${req.traceId}] Public key length: ${passkey.publicKey.length}`,
    );

    const expectedChallenge = await redis.get(mapToChallengeKey(email));

    logger.info(
      `Expected Challenge from redis: ${JSON.stringify(expectedChallenge)}`,
    );

    if (!expectedChallenge) {
      return next(new BadRequestError('Challenge not found'));
    }

    logger.info(`Found passkey: ${JSON.stringify(passkey)}`);

    try {
      const opts: VerifyAuthenticationResponseOpts = {
        response: challengeResponse,
        expectedChallenge: `${expectedChallenge}`,
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

      logger.info(`Verify challenge options: ${JSON.stringify(opts)}`);

      const verification = await verifyAuthenticationResponse(opts);

      logger.info(`Verification result: ${JSON.stringify(verification)}`);

      if (verification.verified) {
        await redis.del(mapToChallengeKey(email));

        const updatedCounter = verification.authenticationInfo.newCounter;

        await UserCredentialCrudService.updateCredentialCounter({
          credId: passkey.credId,
          counter: updatedCounter,
        });

        const accessToken = jwtService.generateToken({
          secret: Env.JWT_ACCESS_SECRET ?? '',
          expiresIn: ONE_MINUTE * 15,
          payload: {
            email,
          },
        });

        const refreshToken = jwtService.generateToken({
          secret: Env.JWT_REFRESH_SECRET ?? '',
          expiresIn: ONE_MONTH,
          payload: {
            email,
          },
        });

        CookieTokensService.setAccessTokenCookie(res, accessToken);
        CookieTokensService.setRefreshTokenCookie(res, refreshToken);

        // Save refresh token to Redis (White list of refresh tokens)
        await redis.set(mapToRefreshTokenKey(email), refreshToken, {
          EX: ONE_MONTH,
        });

        return res
          .status(200)
          .json({ success: true, deviceName: passkey.deviceName });
      }

      return res.status(401).json({ success: false });
    } catch (error: unknown) {
      return next(error);
    }
  },
);

/**
 * @swagger
 * /api/protected/passkeys/:
 *   get:
 *     summary: Get user passkeys
 *     description: Retrieve a list of passkeys associated with the authenticated user.
 *     tags:
 *       - Passkeys
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of user passkeys.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The unique identifier of the passkey.
 *                     example: "abc123"
 *                   deviceName:
 *                     type: string
 *                     description: The name of device.
 *                     example: "Viktor iPhone"
 *                   counter:
 *                     type: integer
 *                     description: The counter value associated with the passkey.
 *                     example: 42
 *       401:
 *         description: Unauthorized. User is not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: "Unauthorized"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: "Internal Server Error"
 */
route.get(
  '/',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!isAuthenticated(user)) {
      return next(new UnauthorizedError(ErrorMessages.unauthorized));
    }

    logger.info(`[${req.traceId}] Get user passKeys started by: ${user.email}`);

    const userCredentialEntities =
      await UserCredentialCrudService.getCredentialByUserId(user.id);

    const userCredentials = modelToPlain<Array<Passkey>>(
      userCredentialEntities,
    );

    const userPassKeysResult: PasskeyResult[] = userCredentials.map(
      (passkey) => ({
        id: passkey.id,
        deviceName: passkey.deviceName,
        counter: passkey.counter,
      }),
    );

    res.status(200).json(userPassKeysResult);
  },
);

/**
 * @swagger
 * /api/protected/passkeys/{passkeyId}:
 *   delete:
 *     summary: Delete a user passkey
 *     description: Deletes a specific passkey associated with the authenticated user.
 *     tags:
 *       - Passkeys
 *     parameters:
 *       - in: path
 *         name: passkeyId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the passkey to delete.
 *         example: "abc123"
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Passkey deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   description: The type of response.
 *                   example: "PASSKEY_DELETED"
 *                 statusCode:
 *                   type: integer
 *                   description: HTTP status code.
 *                   example: 200
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                   example: "Passkey deleted successfully"
 *                 isSuccess:
 *                   type: boolean
 *                   description: Indicates whether the operation was successful.
 *                   example: true
 *       401:
 *         description: Unauthorized. User is not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: "Unauthorized"
 *       404:
 *         description: Passkey not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: "Passkey not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: "Internal Server Error"
 */
route.delete(
  '/:passkeyId',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!isAuthenticated(user)) {
      return next(new UnauthorizedError(ErrorMessages.unauthorized));
    }

    const passkeyId = req.params.passkeyId;

    try {
      const deleteResult = await UserCredentialCrudService.deleteOneByParams({
        id: passkeyId,
        userId: user.id,
      });

      if (deleteResult === 0) {
        throw new NotFoundError('Passkey not found');
      }

      return res.status(200).json({
        type: 'PASSKEY_DELETED',
        statusCode: 200,
        message: 'Passkey deleted successfully',
        isSuccess: true,
      });
    } catch (error: unknown) {
      return next(error);
    }
  },
);

export default route;
