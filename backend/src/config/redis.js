import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  retryStrategy(times) {
    return Math.min(times * 200, 2000);
  },
});

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("ready", () => {
  console.log("Redis ready");
});

redis.on("error", (error) => {
  console.error("Redis error:", error.message);
});

redis.on("reconnecting", () => {
  console.warn("Redis reconnecting...");
});

redis.on("end", () => {
  console.warn("Redis connection closed");
});

export const connectRedis = async () => {
  if (redis.status === "ready" || redis.status === "connecting") {
    return redis;
  }

  await redis.connect();
  return redis;
};

export const disconnectRedis = async () => {
  if (redis.status !== "end") {
    await redis.quit();
  }
};

export default redis;