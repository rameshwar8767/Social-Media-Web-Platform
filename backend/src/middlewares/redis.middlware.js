import redis from '../config/redis.js';

// Pure Redis Rate Limiter (Native ioredis)
export const apiRateLimiter = async (req, res, next) => {
  const key = `rate:${req.ip}`;
  const windowMs = 15 * 60 * 1000;  // 15min
  const maxRequests = 100;
  
  try {
    const count = await redis.incr(key);
    
    if (count === 1) {
      await redis.expire(key, windowMs / 1000);  // Set TTL
    }
    
    if (count > maxRequests) {
      const ttl = await redis.ttl(key);
      return res.status(429).json({
        success: false,
        message: `Rate limited. Max ${maxRequests} reqs/15min`,
        retry_after: ttl,
        remaining: 0
      });
    }
    
    res.set({
      'X-RateLimit-Limit': maxRequests,
      'X-RateLimit-Remaining': maxRequests - count,
      'Retry-After': Math.ceil(windowMs / 1000)
    });
    
    next();
  } catch (error) {
    console.error('Redis rate limit error:', error);
    next();  // Graceful fallback
  }
};

// Custom rate limiter (posts: 20/min, auth: 5/15min)
export const createRateLimiter = (max, windowSeconds = 60) => {
  return async (req, res, next) => {
    const key = `rate:${req.ip}:${req.path}`;
    
    try {
      const count = await redis.incr(key);
      
      if (count === 1) {
        await redis.expire(key, windowSeconds);
      }
      
      if (count > max) {
        const ttl = await redis.ttl(key);
        return res.status(429).json({
          success: false,
          message: `Too many requests. Max ${max}/${windowSeconds}s`,
          retry_after: ttl
        });
      }
      
      next();
    } catch (error) {
      next();
    }
  };
};

// Caching (User + Route specific)
export const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    if (!req.user) return next();
    
    const cacheKey = `cache:${req.user._id}:${req.originalUrl}`;
    
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      const originalJson = res.json;
      res.json = function(data) {
        redis.setex(cacheKey, duration, JSON.stringify(data));
        originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      console.warn('Cache failed:', error.message);
      next();
    }
  };
};

// Auth protection (3 tries/15min)
export const authBruteForce = createRateLimiter(3, 900);

// Post uploads (20/min)
export const postRateLimiter = createRateLimiter(20, 60);

// Feed cache (10min)
export const feedCache = cacheMiddleware(600);
