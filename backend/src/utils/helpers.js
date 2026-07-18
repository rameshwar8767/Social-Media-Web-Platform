export const getPagination = (page = 1, limit = 10, maxLimit = 50) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), maxLimit);
  const skip = (safePage - 1) * safeLimit;

  return {
    page: safePage,
    limit: safeLimit,
    skip,
  };
};

export const buildPaginationMeta = (page, limit, total) => {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1,
  };
};

export const omitFields = (obj = {}, fields = []) => {
  const cloned = { ...obj };

  for (const field of fields) {
    delete cloned[field];
  }

  return cloned;
};

export const pickFields = (obj = {}, fields = []) => {
  return fields.reduce((acc, field) => {
    if (obj[field] !== undefined) {
      acc[field] = obj[field];
    }
    return acc;
  }, {});
};

export const generateOTP = (length = 6) => {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");
};

export const generateUsernameSlug = (value = "") => {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
};

export const sanitizeFileName = (fileName = "") => {
  return fileName
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "-")
    .replace(/-+/g, "-");
};

export const isValidObject = (value) => {
  return value !== null && typeof value === "object" && !Array.isArray(value);
};

export const sleep = (ms = 1000) =>
  new Promise((resolve) => setTimeout(resolve, ms));