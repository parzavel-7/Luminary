import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.warn('REDIS_URL is not defined. Background jobs will not work.');
}

// Upstash Redis requires TLS - convert redis:// to rediss:// if needed
const connectionUrl = (redisUrl || 'redis://localhost:6379').replace('redis://', 'rediss://');
const isUpstash = connectionUrl.includes('upstash.io');

export const redisConnection = new Redis(connectionUrl, {
  maxRetriesPerRequest: null, // Required for BullMQ
  tls: isUpstash ? {} : undefined,
});

redisConnection.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redisConnection.on('connect', () => {
  console.log('Connected to Redis successfully');
});
