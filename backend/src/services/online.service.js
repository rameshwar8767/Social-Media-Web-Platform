import redis from "../config/redis.js";

const ONLINE_KEY_PREFIX = "online:user:";
const ONLINE_USERS_ZSET = "online:users";
const ONLINE_TTL_SECONDS = 300;

const getUserPresenceKey = (userId) => `${ONLINE_KEY_PREFIX}${userId.toString()}`;

const cleanupExpiredUsers = async () => {
  const now = Math.floor(Date.now() / 1000);
  await redis.zremrangebyscore(ONLINE_USERS_ZSET, 0, now);
};

export const setUserOnline = async (userId) => {
  const userIdStr = userId.toString();
  const expiresAt = Math.floor(Date.now() / 1000) + ONLINE_TTL_SECONDS;
  const presenceKey = getUserPresenceKey(userIdStr);

  await Promise.all([
    redis.set(presenceKey, "1", "EX", ONLINE_TTL_SECONDS),
    redis.zadd(ONLINE_USERS_ZSET, expiresAt, userIdStr),
  ]);

  return userIdStr;
};

export const setUserOffline = async (userId) => {
  const userIdStr = userId.toString();
  const presenceKey = getUserPresenceKey(userIdStr);

  await Promise.all([
    redis.del(presenceKey),
    redis.zrem(ONLINE_USERS_ZSET, userIdStr),
  ]);
};

export const getOnlineUsers = async () => {
  await cleanupExpiredUsers();
  return await redis.zrange(ONLINE_USERS_ZSET, 0, -1);
};

export const getOnlineCount = async () => {
  await cleanupExpiredUsers();
  return await redis.zcard(ONLINE_USERS_ZSET);
};

export const isUserOnline = async (userId) => {
  const exists = await redis.exists(getUserPresenceKey(userId));
  return exists === 1;
};

export const getOnlineStatusBatch = async (userIds = []) => {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return [];
  }

  const keys = userIds.map((id) => getUserPresenceKey(id));
  const pipeline = redis.pipeline();

  keys.forEach((key) => pipeline.exists(key));

  const results = await pipeline.exec();

  return userIds.map((id, index) => ({
    userId: id,
    isOnline: results[index][1] === 1,
  }));
};