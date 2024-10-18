import crypto from 'crypto';

export function generateChallenge(): Buffer {
  return crypto.randomBytes(32);
}
