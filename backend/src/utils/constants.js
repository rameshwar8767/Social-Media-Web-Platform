export const DB_NAME = "social_media";

export const ACCESS_TOKEN_COOKIE = "accessToken";
export const REFRESH_TOKEN_COOKIE = "refreshToken";

export const ACCESS_TOKEN_EXPIRY = "1d";
export const REFRESH_TOKEN_EXPIRY = "7d";

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 50;

export const RATE_LIMIT_WINDOW_SECONDS = 15 * 60;
export const RATE_LIMIT_MAX_REQUESTS = 100;

export const AUTH_RATE_LIMIT_MAX = 5;
export const AUTH_RATE_LIMIT_WINDOW_SECONDS = 15 * 60;

export const POST_RATE_LIMIT_MAX = 20;
export const POST_RATE_LIMIT_WINDOW_SECONDS = 60;

export const CACHE_TTL_SECONDS = 300;
export const FEED_CACHE_TTL_SECONDS = 600;

export const ONLINE_TTL_SECONDS = 300;

export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

export const ALLOWED_MEDIA_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_VIDEO_TYPES,
];