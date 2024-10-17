import cbor from 'cbor';
import crypto from 'crypto';
import express, { NextFunction, Request, Response } from 'express';

import { BadRequestError } from '../../core/errors';
import { logger } from '../../core/logger';

const route = express.Router();

const challengeStore: Record<string, Buffer> = {};

const userPublicKeyStore: Record<string, { publicKey: string; rawId: Buffer }> =
  {};

function generateChallenge() {
  return crypto.randomBytes(32);
}

async function extractPublicKey(attestationObject: Buffer) {
  logger.info('Extracting public key from attestation object');

  logger.info('Attestation object:', attestationObject);

  try {
    // Декодируем объект attestationObject с помощью CBOR
    const decodedAttestation = await cbor.decodeFirst(attestationObject);

    logger.info('Decoded Attestation object:', decodedAttestation);

    // Проверяем, что внутри есть необходимое поле 'authData'
    const authData = decodedAttestation.authData;

    logger.info('Auth data:', authData);

    // authData — это бинарный массив данных, из которого мы можем извлечь публичный ключ
    const publicKey = extractPublicKeyFromAuthData(authData);

    logger.info('Extracted public key:', publicKey);

    return publicKey;
  } catch (error) {
    console.error('Error extracting public key:', error);
    throw new Error('Failed to extract public key');
  }
}

// Функция для извлечения публичного ключа из authData
function extractPublicKeyFromAuthData(authData: string) {
  // Длина authData фиксирована: 37 байт
  // Публичный ключ начинается после первых 37 байтов данных
  const publicKeyStartIndex = 37;
  const publicKeyBuffer = authData.slice(publicKeyStartIndex);

  return publicKeyBuffer;
}

route.post('/register', async (req: Request, res: Response) => {
  const user = req.body.user;

  if (!user) {
    return res.status(400).json({ error: 'User not found' });
  }

  logger.info('Registering user:', user.email);

  const challenge = generateChallenge();

  logger.info('Generated challenge:', challenge);

  challengeStore[user.email] = challenge;

  logger.info('Challenge store:', challengeStore);

  res.json({
    challenge: Array.from(challenge),
    rp: { name: 'ChallengeLogger' },
    user: {
      id: user.id,
      name: user.email,
      // displayName: email,
    },
    pubKeyCredParams: [{ alg: -7, type: 'public-key' }], // ES256 algorithm
  });
});

route.post(
  '/verify',
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.body.user;

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    logger.info('Verifying user:', user.email);

    const { rawId, response } = req.body;

    logger.info('Raw ID:', rawId);
    logger.info('Response:', response);

    try {
      // Шаг 1: Извлечь сохраненный challenge для пользователя
      const storedChallenge = challengeStore[user.email];
      if (!storedChallenge) {
        return next(new BadRequestError('Challenge not found'));
      }

      // Шаг 2: Проверить, что challenge совпадает с тем, что был подписан клиентом
      const clientDataJSON = Buffer.from(response.clientDataJSON, 'base64');
      const clientData = JSON.parse(clientDataJSON.toString());

      logger.info('Client data:', clientData);

      logger.info('Stored challenge:', storedChallenge);

      if (
        Buffer.from(clientData.challenge, 'base64').toString() !==
        storedChallenge.toString('base64')
      ) {
        return next(new BadRequestError('Invalid challenge'));
      }

      // Шаг 3: Извлечь публичный ключ из attestationObject
      const attestationObject = Buffer.from(
        response.attestationObject,
        'base64',
      );
      const publicKey = await extractPublicKey(attestationObject);

      // Шаг 4: Сохранить публичный ключ в userPublicKeyStore
      userPublicKeyStore[user.email] = {
        publicKey: publicKey,
        rawId: Buffer.from(rawId, 'base64'), // Сохраняем rawId
      };

      logger.info('User public key store:', userPublicKeyStore);

      // Шаг 5: Удалить challenge после успешной верификации
      delete challengeStore[user.email];

      logger.info('Challenge store after verification:', challengeStore);

      // Возвращаем успешный ответ
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Verification error:', error);
      return next(new BadRequestError('Verification failed'));
    }
  },
);

export default route;
