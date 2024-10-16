import cbor from 'cbor';

import { ChallengeVerifyBody } from './types';
import { logger } from '../../core/logger';

export async function getUserPublicKey(
  publicKeyData: ChallengeVerifyBody['publicKey'],
): Promise<Buffer> {
  const { attestationObject } = publicKeyData.response;

  // Извлекаем публичный ключ из attestationObject
  const publicKey =
    await extractPublicKeyFromAttestationObject(attestationObject);

  return publicKey;
}

export async function extractPublicKeyFromAttestationObject(
  attestationObject: number[],
): Promise<Buffer> {
  // Преобразуем массив number[] в Buffer
  const attestationBuffer = Buffer.from(attestationObject);

  // Декодируем attestationObject с использованием CBOR
  const decodedAttestation = await cbor.decodeFirst(attestationBuffer);

  logger.info(
    `[extractPublicKeyFromAttestationObject] Decoded attestation object: ${JSON.stringify(
      decodedAttestation,
    )}`,
  );

  // Проверяем, что в decodedAttestation есть authData
  const authData = decodedAttestation.authData;

  if (!authData) {
    throw new Error('authData not found in attestationObject');
  }

  const publicKey = extractPublicKeyFromAuthData(authData);

  return publicKey;
}

function extractPublicKeyFromAuthData(authData: Buffer): Buffer {
  // authData — это бинарный массив, публичный ключ начинается после 37 байт
  const publicKeyStartIndex = 37;

  logger.info(
    `[extractPublicKeyFromAuthData] Extracting public key from authData. AuthData length: ${authData.length}`,
  );

  logger.info(
    `[extractPublicKeyFromAuthData] AuthData ${JSON.stringify(authData)}`,
  );

  if (authData.length < publicKeyStartIndex) {
    throw new Error('authData too short to extract public key');
  }

  const cosePublicKey = authData.slice(publicKeyStartIndex);

  logger.info(
    `[extractPublicKeyFromAuthData] Extracted COSE public key: ${JSON.stringify(cosePublicKey)}`,
  );

  const decodedCoseKey = cbor.decodeFirstSync(cosePublicKey);

  if (decodedCoseKey instanceof Map) {
    logger.info(
      `[extractPublicKeyFromAuthData] COSE Key Map: ${JSON.stringify(Array.from(decodedCoseKey.entries()))}`,
    );
  }

  logger.info(
    `[extractPublicKeyFromAuthData] Decoded COSE public key: ${JSON.stringify(decodedCoseKey)}`,
  );

  const x = decodedCoseKey.get(-2); // Поле x
  const y = decodedCoseKey.get(-3);

  if (!x || !y) {
    throw new Error('Missing x or y in COSE key');
  }

  logger.info(
    `[extractPublicKeyFromAuthData] Extracted x: ${JSON.stringify(x)}`,
  );
  logger.info(
    `[extractPublicKeyFromAuthData] Extracted y: ${JSON.stringify(y)}`,
  );

  const publicKeyBuffer = Buffer.concat([Buffer.from([0x04]), x, y]);

  logger.info(
    `[extractPublicKeyFromAuthData] Extracted public key. Key length: ${publicKeyBuffer.length}. Key: ${publicKeyBuffer.toString('hex')}`,
  );

  return publicKeyBuffer;
}
