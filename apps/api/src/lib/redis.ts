import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.warn('REDIS_URL is not defined. Background jobs will not work.');
}

// Upstash Redis requires TLS - convert redis:// to rediss:// if needed
const isLocal = !redisUrl || redisUrl.includes('localhost') || redisUrl.includes('127.0.0.1');
const connectionUrl = (redisUrl || 'redis://localhost:6379').replace('redis://', isLocal ? 'redis://' : 'rediss://');
const isUpstash = connectionUrl.includes('upstash.io');

export const redisConnection = new Redis(connectionUrl, {
  maxRetriesPerRequest: null, // Required for BullMQ
  tls: (isUpstash || (!isLocal && connectionUrl.startsWith('rediss'))) ? {} : undefined,
  keepAlive: 30000, // 30 seconds TCP KeepAlive
  retryStrategy(times) {
    // Exponential backoff strategy for retrying connection, max delay of 3000ms
    const delay = Math.min(times * 100, 3000);
    return delay;
  },
  reconnectOnError(err) {
    const targetError = 'READONLY';
    if (err.message.slice(0, targetError.length) === targetError) {
      // Reconnect on READONLY error (common in cloud Redis cluster primary failover)
      return true;
    }
    return false;
  }
});

redisConnection.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redisConnection.on('connect', () => {
  console.log('Connected to Redis successfully');
});
