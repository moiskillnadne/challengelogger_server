import { createClient } from 'redis';

import { logger } from '../core/logger';

export const redis = createClient();

redis.on('error', (err) => {
  logger.error('Redis error: ', JSON.stringify(err));
});

redis.on('connect', () => {
  logger.info('Redis connected');
});
