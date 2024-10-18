import cbor from 'cbor';
import crypto from 'crypto';
import express, { Request, Response } from 'express';

import { logger } from '../../core/logger';

const route = express.Router();

interface ChallengeRegisterResponse {
  challenge: number[];
  rp: { name: string };
  user: { id: string; name: string };
  pubKeyCredParams: { alg: number; type: string }[];
}

interface ChallengeVerifyBody {
  publicKey: {
    id: 'some-credential-id';
    rawId: [109, 98, 78, 45];
    response: {
      clientDataJSON: [101, 120, 97, 109, 112, 108, 101];
      attestationObject: [120, 50, 101, 45, 76, 105];
    };
    type: 'public-key';
  };
  email: string;
}

const challengeStore: Record<string, Buffer> = {};

const userPublicKeyStore: Record<string, ChallengeVerifyBody['publicKey']> = {};

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

  const params: ChallengeRegisterResponse = {
    challenge: Array.from(challenge),
    rp: { name: 'ChallengeLogger' },
    user: {
      id: user.id,
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

  logger.info('Verifying user:', email);
  logger.info('Public key:', publicKey);

  userPublicKeyStore[email] = publicKey;

  logger.info('User public key store:', userPublicKeyStore);

  res.json({ success: true });
});

export default route;
