import redis from '../config/redis.js';

export const setUserOnline = async (userId) => {
  const userIdStr = userId.toString();
  await redis.sadd('online_users', userIdStr);
  await redis.expire('online_users', 300);  // 5min TTL
  return userIdStr;
};

export const setUserOffline = async (userId) => {
  await redis.srem('online_users', userId.toString());
};

export const getOnlineUsers = async () => {
  return await redis.smembers('online_users');
};

export const getOnlineCount = async () => {
  return await redis.scard('online_users');
};

export const isUserOnline = async (userId) => {
  const userIdStr = userId.toString();
  const onlineUsers = await redis.sismember('online_users', userIdStr);
  return Boolean(onlineUsers);
};

// Batch check multiple users
export const getOnlineStatusBatch = async (userIds) => {
  const userIdStrs = userIds.map(id => id.toString());
  const statuses = await redis.smismember('online_users', userIdStrs);
  return userIds.map((id, index) => ({
    userId: id,
    isOnline: statuses[index]
  }));
};
