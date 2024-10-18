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

  verifier.update(data);
  verifier.end();

  return verifier.verify(publicKey, signature);
}
