import fs from "fs";
import path from "path";
import winston from "winston";
import { ApiError } from "../utils/ApiError.js";

const logsDir = path.resolve("logs");

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
    }),
    ...(process.env.NODE_ENV !== "production"
      ? [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.simple()
            ),
          }),
        ]
      : []),
  ],
});

const formatDuplicateKeyError = (err) => {
  const fields = Object.keys(err.keyValue || {});
  return {
    statusCode: 409,
    message: "Duplicate field value entered",
    errors: fields.map((field) => `${field} already exists`),
  };
};

export const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = [];

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors || [];
  } else if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((value) => value.message);
  } else if (err.code === 11000) {
    const duplicateError = formatDuplicateKeyError(err);
    statusCode = duplicateError.statusCode;
    message = duplicateError.message;
    errors = duplicateError.errors;
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path || "resource"} id`;
  }

  logger.error({
    message,
    statusCode,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?._id || "anonymous",
    userAgent: req.get("user-agent"),
    stack: err.stack,
  });

  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export { logger };