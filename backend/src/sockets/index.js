import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { handleChatEvents } from "./chat.handler.js";
import { setUserOnline, setUserOffline } from "../services/online.service.js";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket, next) => {
    try {
      const bearerToken = socket.handshake.headers.authorization
        ?.replace("Bearer ", "")
        .trim();

      const token = socket.handshake.auth?.token || bearerToken;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      const user = await User.findById(decoded._id).select(
        "_id username profile_picture"
      );

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", async (socket) => {
    try {
      const userRoom = socket.user._id.toString();

      socket.join(userRoom);
      await setUserOnline(socket.user._id);

      console.log(
        `Socket connected: ${socket.user.username} (${socket.user._id})`
      );

      socket.broadcast.emit("user_online", {
        userId: socket.user._id,
        username: socket.user.username,
      });

      socket.on("join_chat", async ({ chatId }) => {
        try {
          if (!chatId) return;
          socket.join(chatId.toString());

          socket.to(chatId.toString()).emit("user_joined_chat", {
            userId: socket.user._id,
            username: socket.user.username,
          });
        } catch (error) {
          socket.emit("socket_error", {
            message: error.message || "Unable to join chat",
          });
        }
      });

      handleChatEvents(socket, io);

      socket.on("disconnect", async () => {
        try {
          await setUserOffline(socket.user._id);

          console.log(`Socket disconnected: ${socket.user.username}`);

          socket.broadcast.emit("user_offline", {
            userId: socket.user._id,
          });
        } catch (error) {
          console.error("Socket disconnect cleanup error:", error.message);
        }
      });
    } catch (error) {
      socket.emit("socket_error", {
        message: error.message || "Socket connection setup failed",
      });
      socket.disconnect();
    }
  });

  console.log("Socket.IO initialized");
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO is not initialized");
  }

  return io;
};