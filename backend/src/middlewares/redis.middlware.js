import redis from "../config/redis.js";

const rateLimitScript = `
  local current = redis.call("INCR", KEYS[1])
  if current == 1 then
    redis.call("EXPIRE", KEYS[1], ARGV[1])
  end
  local ttl = redis.call("TTL", KEYS[1])
  return {current, ttl}
`;

const applyRateLimitHeaders = (res, maxRequests, remaining, retryAfter) => {
  res.set({
    "X-RateLimit-Limit": String(maxRequests),
    "X-RateLimit-Remaining": String(Math.max(0, remaining)),
    "X-RateLimit-Reset": String(Math.max(0, retryAfter)),
  });
};

export const apiRateLimiter = async (req, res, next) => {
  const windowSeconds = 15 * 60;
  const maxRequests = 100;
  const identity = req.user?._id?.toString() || req.ip;
  const key = `rate:global:${identity}`;

  try {
    const [count, ttl] = await redis.eval(rateLimitScript, 1, key, windowSeconds);
    const remaining = maxRequests - Number(count);

    applyRateLimitHeaders(res, maxRequests, remaining, ttl);

    if (Number(count) > maxRequests) {
      res.set("Retry-After", String(Math.max(0, ttl)));
      return res.status(429).json({
        success: false,
        message: `Rate limit exceeded. Max ${maxRequests} requests per ${windowSeconds} seconds`,
        retry_after: Math.max(0, ttl),
        remaining: 0,
      });
    }

    return next();
  } catch (error) {
    console.error("Redis rate limit error:", error.message);
    return next();
  }
};

export const createRateLimiter = (maxRequests, windowSeconds = 60, scope = "route") => {
  return async (req, res, next) => {
    const identity = req.user?._id?.toString() || req.ip;
    const routeKey = scope === "route" ? req.baseUrl + req.path : scope;
    const key = `rate:${routeKey}:${identity}`;

    try {
      const [count, ttl] = await redis.eval(
        rateLimitScript,
        1,
        key,
        windowSeconds
      );

      const remaining = maxRequests - Number(count);
      applyRateLimitHeaders(res, maxRequests, remaining, ttl);

      if (Number(count) > maxRequests) {
        res.set("Retry-After", String(Math.max(0, ttl)));
        return res.status(429).json({
          success: false,
          message: `Too many requests. Max ${maxRequests} requests per ${windowSeconds} seconds`,
          retry_after: Math.max(0, ttl),
          remaining: 0,
        });
      }

      return next();
    } catch (error) {
      console.error("Custom rate limiter error:", error.message);
      return next();
    }
  };
};

export const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const cacheKey = `cache:${req.user._id}:${req.originalUrl}`;

    try {
      const cachedValue = await redis.get(cacheKey);

      if (cachedValue) {
        return res.status(200).json(JSON.parse(cachedValue));
      }

      const originalJson = res.json.bind(res);

      res.json = function (data) {
        redis
          .set(cacheKey, JSON.stringify(data), "EX", duration)
          .catch((error) => {
            console.warn("Cache write failed:", error.message);
          });

        return originalJson(data);
      };

      return next();
    } catch (error) {
      console.warn("Cache read failed:", error.message);
      return next();
    }
  };
};

export const authBruteForce = createRateLimiter(5, 15 * 60, "auth");
export const postRateLimiter = createRateLimiter(20, 60, "post-upload");
export const feedCache = cacheMiddleware(10 * 60);