import cbor from 'cbor';

import { ChallengeVerifyBody } from './types';

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

  // Проверяем, что в decodedAttestation есть authData
  const authData = decodedAttestation.authData;

  if (!authData) {
    throw new Error('authData not found in attestationObject');
  }

  // Извлекаем публичный ключ из authData
  const publicKey = extractPublicKeyFromAuthData(authData);

  return publicKey;
}

function extractPublicKeyFromAuthData(authData: Buffer): Buffer {
  // authData — это бинарный массив, публичный ключ начинается после 37 байт
  const publicKeyStartIndex = 37;

  // Извлекаем публичный ключ (необходима корректная длина, в зависимости от структуры данных)
  const publicKeyBuffer = authData.slice(publicKeyStartIndex);

  return publicKeyBuffer;
}
