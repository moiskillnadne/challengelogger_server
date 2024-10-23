import { Env } from '../constants';

export const isProduction = Env.APP_ENV === 'prod';

export const isDevelopment = Env.APP_ENV === 'dev';

export const isLocal = Env.APP_ENV === 'local';
