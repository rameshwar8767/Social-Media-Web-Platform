import winston from 'winston';  // npm i winston
import { ApiError } from '../utils/ApiError.js';

// Logger setup
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    ...(process.env.NODE_ENV !== 'production' ? [new winston.transports.Console()] : [])
  ]
});

export const errorMiddleware = (err, req, res, next) => {
  // Set default values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errorDetails = [];

  // Handle custom ApiError
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errorDetails = err.errors || [];
  }
  // Mongoose validation errors
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errorDetails = Object.values(err.errors).map(val => val.message);
  }
  // Mongoose duplicate key (unique fields)
  else if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
    errorDetails = [`${Object.keys(err.keyValue).join(', ')} already exists`];
  }
  // JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }
  // CastError (invalid ObjectId)
  else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource ID';
  }

  // Log error (always, no stack in prod)
  const logError = {
    message,
    statusCode,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId: req.user?._id || 'anonymous',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };
  logger.error(logError);

  // Send response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    ...(errorDetails.length > 0 && { errors: errorDetails })
  });
};


