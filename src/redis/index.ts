import { createClient } from 'redis';

export const redis = createClient();

redis.on('error', (err) => {
  console.error('Redis error: ', JSON.stringify(err));
});

redis.on('connect', () => {
  console.info('Redis connected');
});
