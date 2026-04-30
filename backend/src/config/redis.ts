import Redis from 'ioredis';

const redis = new Redis({
  host: '127.0.0.1',
  port: 6379,
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    if (times > 10) return null;
    return Math.min(times * 50, 2000);
  },
  enableOfflineQueue: true,
});

redis.on('connect', () => console.log('✅ Redis connected'));
redis.on('error', (err) => console.error('❌ Redis error:', err.message));

export default redis;
