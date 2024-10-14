import { createClient } from 'redis';

import { logger } from '../core/logger';

export const redis = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/${process.env.REDIS_DB}`,
});

redis.on('error', (err) => {
  logger.error('Redis error: ', JSON.stringify(err));
});

redis.on('connect', () => {
  logger.info('Redis connected');
});
