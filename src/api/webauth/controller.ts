import express, { Request, Response } from 'express';

import { generateChallenge } from './generateChallenge';
import { getUserPublicKey } from './publicKeyExtractor';
import { challengeStore, userPublicKeyStore } from './tmp-store';
import {
  AuthChallengeResponse,
  AuthVerifyRequest,
  ChallengeRegisterResponse,
  ChallengeVerifyBody,
} from './types';
import { verifySignature } from './verifySignature';
import { numberArrayToBase64 } from '../../core/utils';

import { logger } from '~/core/logger';

const route = express.Router();

route.post('/register', async (req: Request, res: Response) => {
  const user = req.body.user;

  if (!user) {
    return res.status(400).json({ error: 'User not found' });
  }

  logger.info(`Registering user: ${user.email}`);

  const challenge = generateChallenge();

  logger.info(`Generated challenge: ${challenge.toString('hex')}`);

  challengeStore[user.email] = challenge;

  logger.info(`Challenge store: ${JSON.stringify(challengeStore)}`);

  const params: ChallengeRegisterResponse = {
    challenge: Array.from(challenge),
    rp: { name: 'ChallengeLogger' },
    user: {
      id: user.email,
      name: user.email,
    },
    pubKeyCredParams: [{ alg: -7, type: 'public-key' }], // ES256 algorithm
  };

  res.json(params);
});

route.post('/verify', async (req: Request, res: Response) => {
  const { email, publicKey } = req.body as ChallengeVerifyBody;

  if (!email) {
    return res.status(400).json({ error: 'email not provided' });
  }

  logger.info(`Verifying user: ${email}`);
  logger.info(`Public key: ${publicKey}`);

  userPublicKeyStore[email] = publicKey;

  logger.info(`User public key store: ${JSON.stringify(userPublicKeyStore)}`);

  res.json({ success: true });
});

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

  const clientDataJSON = Buffer.from(response.clientDataJSON, 'base64');
  const authenticatorData = Buffer.from(response.authenticatorData, 'base64');
  const signature = Buffer.from(response.signature, 'base64');

  const signedData = Buffer.concat([authenticatorData, clientDataJSON]);

  const publicKey = await getUserPublicKey(userPublicKey);

  // Проверяем подпись с использованием публичного ключа
  const isVerified = verifySignature(publicKey, signedData, signature);

  if (!isVerified) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  res.json({ success: true });
});

export default route;
