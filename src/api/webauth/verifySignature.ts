import cbor from 'cbor';
import { createVerify } from 'crypto';

/**
 * Функция для проверки подписи challenge, подписанного приватным ключом пользователя
 *
 * @param publicKey - Публичный ключ пользователя (Buffer)
 * @param data - Данные, которые были подписаны (Buffer)
 * @param signature - Подпись, предоставленная клиентом (Buffer)
 * @returns boolean - Успешна ли верификация
 */
export function verifySignature(
  publicKey: Buffer,
  data: Buffer,
  signature: Buffer,
): boolean {
  const verifier = createVerify('sha256');

  const pem = coseToPem(publicKey);

  verifier.update(data);
  verifier.end();

  return verifier.verify(pem, signature);
}

/**
 * Преобразование COSE-публичного ключа в PEM-формат
 * @param publicKey - COSE-публичный ключ
 * @returns Публичный ключ в PEM-формате
 */
function coseToPem(cosePublicKey: Buffer): string {
  // Декодируем COSE-публичный ключ (используем cbor)
  const publicKeyStruct = cbor.decode(cosePublicKey);

  // Извлекаем ключи x и y из структуры
  const x = publicKeyStruct.get(-2);
  const y = publicKeyStruct.get(-3);

  // Добавляем стандартный заголовок и объединяем x и y для создания ключа
  const pubKey = Buffer.concat([Buffer.from([0x04]), x, y]);

  // Формируем PEM-формат для публичного ключа
  const pem = `
-----BEGIN PUBLIC KEY-----
${pubKey
  .toString('base64')
  .match(/.{1,64}/g)
  .join('\n')}
-----END PUBLIC KEY-----
  `.trim();

  return pem;
}
