import Redis from 'ioredis';
import config from '../config/config.js';
import logger from './logger.js';

const redis = new Redis({
  host: config.db.redis.host,
  port: config.db.redis.port,
  password: config.db.redis.password,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('error', (error) => {
  logger.error('Redis Error:', error);
});

redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

export default redis;
