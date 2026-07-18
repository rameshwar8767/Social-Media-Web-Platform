import fs from "fs";
import path from "path";
import winston from "winston";

const logsDir = path.resolve("logs");

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const isProduction = process.env.NODE_ENV === "production";

const logger = winston.createLogger({
  level: isProduction ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: "social-media-backend",
  },
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
    }),
    ...(!isProduction
      ? [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.printf(({ level, message, timestamp, stack }) => {
                return `${timestamp} ${level}: ${stack || message}`;
              })
            ),
          }),
        ]
      : []),
  ],
});

export { logger };
export default logger;