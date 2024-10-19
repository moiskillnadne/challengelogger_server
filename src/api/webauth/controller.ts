import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/server/script/deps';
import express, { NextFunction, Request, Response } from 'express';

import { generateChallenge } from './generateChallenge';
import { getUserPublicKey } from './publicKeyExtractor';
import { challengeStore, userPublicKeyStore } from './tmp-store';
import { AuthChallengeResponse, AuthVerifyRequest, Passkey } from './types';
import { verifySignature } from './verifySignature';
import { rpID, rpName } from '../../core/constants';
import { redis } from '../../redis';
import { mapToChallengeKey } from '../../redis/mappers';
import { UserCredentialCrudService } from '../../shared/UserCredential';

import { ErrorMessages } from '~/core/dictionary/error.messages';
import { UnauthorizedError } from '~/core/errors';
import { logger } from '~/core/logger';
import { numberArrayToBase64 } from '~/core/utils';
import { isAuthenticated } from '~/shared/user';

const route = express.Router();

route.post(
  '/register',
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
        id: passkey.id,
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
      });

      if (verification.verified) {
        const { registrationInfo } = verification;

        return res.status(200).json({ success: true, data: registrationInfo });
      }
    } catch (error: unknown) {
      logger.error(`Error verifying registration: ${error}`);
      return res.status(404).json({ isSuccess: false, error });
    }
  },
);

route.post('/login-challenge', async (req: Request, res: Response) => {
  const email = req.body.email;

  if (!email) {
    return res.status(400).json({ error: 'email not provided' });
  }

  logger.info(`Logging in user: ${email}`);

  const challenge = generateChallenge();

  logger.info(`Generated challenge: ${challenge.toString('hex')}`);

  challengeStore[email] = challenge;

  logger.info(`Challenge store: ${JSON.stringify(challengeStore)}`);

  const challengeParams: AuthChallengeResponse = {
    challenge: Array.from(challenge),
    rp: { name: 'ChallengeLogger' },
    user: {
      id: email,
      name: email,
    },
    allowCredentials: [
      {
        type: 'public-key',
        id: numberArrayToBase64(userPublicKeyStore[email].rawId),
      },
    ],
  };

  res.json(challengeParams);
});

route.post('/login-verify', async (req: Request, res: Response) => {
  const { email, response } = req.body as AuthVerifyRequest;

  if (!email) {
    return res.status(400).json({ error: 'Email not provided' });
  }

  const userPublicKey = userPublicKeyStore[email];

  if (!userPublicKey) {
    return res
      .status(400)
      .json({ error: 'User not found or public key missing' });
  }

  const storedChallenge = challengeStore[email];

  if (!storedChallenge) {
    return res.status(400).json({ error: 'Challenge not found' });
  }

  try {
    const clientDataJSON = Buffer.from(response.clientDataJSON, 'base64');
    const authenticatorData = Buffer.from(response.authenticatorData, 'base64');
    const signature = Buffer.from(response.signature, 'base64');

    const signedData = Buffer.concat([authenticatorData, clientDataJSON]);

    const publicKey = await getUserPublicKey(userPublicKey);

    logger.info(`Verifying signature for user: ${email}`);
    logger.info(`Public key: ${publicKey.toString('hex')}`);
    logger.info(`Signed data: ${signedData.toString('hex')}`);
    logger.info(`Signature: ${signature.toString('hex')}`);

    const isVerified = verifySignature(publicKey, signedData, signature);

    if (!isVerified) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    res.json({ success: true });
  } catch (error: unknown) {
    logger.error(`Error verifying signature: ${error}`);
    return res.status(500).json({ error: 'Error verifying signature' });
  }
});

export default route;
