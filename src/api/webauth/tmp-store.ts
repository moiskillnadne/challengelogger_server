import { ChallengeVerifyBody } from './types';

export const challengeStore: Record<string, Buffer> = {};

export const userPublicKeyStore: Record<
  string,
  ChallengeVerifyBody['publicKey']
> = {};
