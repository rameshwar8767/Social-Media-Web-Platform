import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from 'helmet';

/* Routes */
import healthCheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import postRoutes from "./routes/post.routes.js";
import userRoutes from "./routes/user.routes.js";
import reelsRoutes from './routes/reels.routes.js';
import storiesRoutes from './routes/stories.routes.js';
import notificationRoutes from "./routes/notification.routes.js";
import chatsRoutes from "./routes/chats.routes.js";
import commentsRoutes from './routes/comments.routes.js';
import feedRoutes from './routes/feed.routes.js';
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { apiRateLimiter } from './middlewares/redis.middlware.js';

const app = express();

/* ==============================
   MIDDLEWARE (BEFORE ROUTES)
================================ */
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

/* ==============================
   ROUTES (MIDDLEWARE AFTER)
================================ */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Social Media API Live",
    endpoints: ["/api/v1/auth", "/api/v1/users", "/api/v1/posts", "/api/v1/chats"]
  });
});

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use('/api/v1/auth', apiRateLimiter, authRouter);
app.use('/api/v1/posts', apiRateLimiter, postRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/reels", reelsRoutes);
app.use("/api/v1/stories", storiesRoutes);
app.use("/api/v1/chats", chatsRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use('/api/v1/comments', commentsRoutes);
app.use('/api/v1/feed', feedRoutes);

/* ==============================
   404 HANDLER (AFTER ROUTES)
================================ */
app.use((req, res, next) => {  // ✅ Named function, AFTER routes
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

/* ==============================
   ERROR HANDLER (LAST!)
================================ */
app.use(errorMiddleware);

export default app;  // Export Express app
