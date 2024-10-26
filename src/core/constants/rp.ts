import { Env } from './env';

export const rpName = 'Challenge Logger';

export const rpID = Env.RP_ID ?? 'localhost:3001';

export const origin = `https://${rpID}`;
