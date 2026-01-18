import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import fs from 'fs';

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST']
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || 
                   socket.handshake.headers.authorization?.replace('Bearer ', '');
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      socket.user = await User.findById(decoded._id).select('username _id profile_picture');
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`👤 ${socket.user.username} connected (ID: ${socket.user._id})`);

    // Online status broadcast ✅
    socket.broadcast.emit('user_online', { 
      userId: socket.user._id, 
      username: socket.user.username 
    });
    
    socket.on('disconnect', () => {
      console.log(`👤 ${socket.user.username} disconnected`);
      socket.broadcast.emit('user_offline', socket.user._id);
    });

    // Personal room
    socket.join(socket.user._id.toString());

    // Chat events
    socket.on('join_chat', ({ chatId }) => {
      socket.join(chatId);
      socket.to(chatId).emit('user_joined_chat', {
        userId: socket.user._id,
        username: socket.user.username
      });
    });

    // Message handler (fixed media buffer → path)
    socket.on('send_message', async ({ chatId, content, type = 'text', mediaPath }) => {
      let messageData = {
        chatId,
        sender: socket.user._id,
        senderName: socket.user.username,
        content,
        type,
        timestamp: new Date().toISOString()
      };

      // Media upload (path from multer)
      if (mediaPath) {
        try {
          const result = await uploadToCloudinary(mediaPath, {
            folder: 'social_media/chats',
            resource_type: 'auto'
          });
          messageData.media = {
            url: result.secure_url,
            public_id: result.public_id
          };
          fs.unlinkSync(mediaPath);  // Cleanup
        } catch (err) {
          socket.emit('message_error', { error: 'Media upload failed' });
          return;
        }
      }

      // Broadcast to chat room
      socket.to(chatId).emit('receive_message', messageData);
      
      // Echo to sender
      socket.emit('message_sent', messageData);
    });

    // Typing indicator
    socket.on('typing', ({ chatId, isTyping }) => {
      socket.to(chatId).emit('user_typing', { 
        userId: socket.user._id, 
        username: socket.user.username,
        isTyping 
      });
    });

    // Message read
    socket.on('message_read', ({ chatId, messageId }) => {
      socket.to(chatId).emit('message_read', { messageId });
    });
  });

  console.log('✅ Socket.IO initialized');
  return io;
};

export const getIO = () => io;
