const NodeCache = require('node-cache');
const Redis = require('ioredis');

// Use Redis in production, in-memory cache in development
const isProduction = process.env.NODE_ENV === 'production';

let cache;

if (isProduction && process.env.REDIS_URL) {
  // Use Redis in production
  const redisClient = new Redis(process.env.REDIS_URL);
  
  cache = {
    get: (key) => redisClient.get(key).then(JSON.parse).catch(() => null),
    set: (key, value, ttl) => 
      redisClient.set(key, JSON.stringify(value), 'EX', ttl || 3600),
    del: (key) => redisClient.del(key),
    flush: () => redisClient.flushdb()
  };
} else {
  // Use in-memory cache in development
  const nodeCache = new NodeCache({
    stdTTL: 3600, // Default TTL: 1 hour
    checkperiod: 600, // Check for expired items every 10 minutes
    useClones: false
  });

  cache = {
    get: (key) => new Promise((resolve) => {
      const value = nodeCache.get(key);
      resolve(value || null);
    }),
    set: (key, value, ttl) => new Promise((resolve) => {
      const success = nodeCache.set(key, value, ttl || 3600);
      resolve(success);
    }),
    del: (key) => new Promise((resolve) => {
      const count = nodeCache.del(key);
      resolve(count > 0);
    }),
    flush: () => new Promise((resolve) => {
      nodeCache.flushAll();
      resolve(true);
    })
  };
}

// Higher-level cache functions
const withCache = async (key, fn, ttl = 3600) => {
  // Try to get from cache first
  const cached = await cache.get(key);
  if (cached !== null) {
    return cached;
  }
  
  // If not in cache, execute the function
  const result = await fn();
  
  // Cache the result if it's not null/undefined
  if (result !== null && result !== undefined) {
    await cache.set(key, result, ttl);
  }
  
  return result;
};

const clearCache = async (key) => {
  if (key.endsWith('*')) {
    // Handle wildcard clearing (only works with Redis)
    if (cache.keys) {
      const keys = await cache.keys(key);
      await Promise.all(keys.map(k => cache.del(k)));
    }
  } else {
    await cache.del(key);
  }
};

const flushAll = async () => {
  await cache.flush();
};

// For debugging
const getCacheStats = () => {
  if (cache.getStats) {
    return cache.getStats();
  }
  return { provider: isProduction ? 'Redis' : 'Memory' };
};

module.exports = {
  cache,
  withCache,
  clearCache,
  flushAll,
  getCacheStats
};
