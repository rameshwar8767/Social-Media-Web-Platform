// import { Server } from 'socket.io';
// import jwt from 'jsonwebtoken';
// import { User } from '../models/user.model.js';
// import { uploadToCloudinary } from '../config/cloudinary.js';
// import fs from 'fs';
// import redis from '../config/redis.js';  // For online status

// let io;

// export const initSocket = (httpServer) => {
//   io = new Server(httpServer, {
//     cors: {
//       origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//       credentials: true,
//       methods: ['GET', 'POST']
//     }
//   });

//   io.use(async (socket, next) => {
//     try {
//       const token = socket.handshake.auth.token || 
//                    socket.handshake.headers.authorization?.replace('Bearer ', '');
//       if (!token) return next(new Error('Authentication required'));

//       const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//       socket.user = await User.findById(decoded._id).select('username _id profile_picture');
//       next();
//     } catch (error) {
//       next(new Error('Invalid token'));
//     }
//   });

//   io.on('connection', (socket) => {
//     console.log(`👤 ${socket.user.username} connected (ID: ${socket.user._id})`);

//     // Online status → Redis
//     redis.sadd('online_users', socket.user._id.toString());
//     redis.expire('online_users', 300);  // 5min TTL

//     socket.broadcast.emit('user_online', { 
//       userId: socket.user._id, 
//       username: socket.user.username 
//     });
    
//     socket.on('disconnect', async () => {
//       console.log(`👤 ${socket.user.username} disconnected`);
//       await redis.srem('online_users', socket.user._id.toString());
//       socket.broadcast.emit('user_offline', socket.user._id);
//     });

//     // Personal room
//     socket.join(socket.user._id.toString());

//     // Chat events
//     socket.on('join_chat', ({ chatId }) => {
//       socket.join(chatId);
//       socket.to(chatId).emit('user_joined_chat', {
//         userId: socket.user._id,
//         username: socket.user.username,
//         profile_picture: socket.user.profile_picture
//       });
//     });

//     // Enhanced message handler ✅
//     socket.on('send_message', async ({ chatId, content, type = 'text', media }) => {
//       let messageData = {
//         chatId,
//         sender: socket.user._id,
//         senderName: socket.user.username,
//         senderPic: socket.user.profile_picture,
//         content,
//         type,
//         timestamp: new Date().toISOString()
//       };

//       // Media upload (file path or buffer)
//       if (media && media.path) {
//         try {
//           const result = await uploadToCloudinary(media.path, {
//             folder: 'social_media/chats',
//             resource_type: 'auto'
//           });
//           messageData.media = {
//             url: result.secure_url,
//             public_id: result.public_id,
//             type: media.type || 'image'
//           };
//           fs.unlinkSync(media.path);  // Cleanup
//         } catch (err) {
//           socket.emit('message_error', { error: 'Media upload failed' });
//           return;
//         }
//       }

//       // Broadcast to room
//       socket.to(chatId).emit('receive_message', messageData);
      
//       // Echo to sender
//       socket.emit('message_sent', messageData);
//     });

//     // Typing indicator
//     socket.on('typing', ({ chatId, isTyping }) => {
//       socket.to(chatId).emit('user_typing', { 
//         userId: socket.user._id, 
//         username: socket.user.username,
//         isTyping 
//       });
//     });

//     // Message read receipt
//     socket.on('message_read', ({ chatId, messageId }) => {
//       socket.to(chatId).emit('message_read', { 
//         messageId, 
//         userId: socket.user._id 
//       });
//     });
//   });

//   console.log('✅ Socket.IO initialized');
//   return io;
// };

// export const getIO = () => io;
import { getIO } from './index.js';
import { Notification } from '../models/Notification.js';
import { createNotification } from '../services/notification.service.js';
import { Post } from '../models/Post.js';
import { Reel } from '../models/Reel.js';
import { Comment } from '../models/Comment.js';

export const initNotificationHandler = (io) => {
  // Like notifications (posts/reels/comments)
  io.on('connection', (socket) => {
    // Post like → Notify owner
    socket.on('post_liked', async ({ postId, action }) => {  // action: 'like' | 'unlike'
      const post = await Post.findById(postId).populate('user');
      if (!post || post.user._id.equals(socket.user._id)) return;

      if (action === 'like') {
        const notification = await createNotification(
          'like_post',
          post.user._id,
          socket.user._id,
          { post: postId }
        );
        
        // Emit to recipient
        io.to(post.user._id.toString()).emit('new_notification', notification);
      }
    });

    // Reel like
    socket.on('reel_liked', async ({ reelId, action }) => {
      const reel = await Reel.findById(reelId).populate('user');
      if (!reel || reel.user._id.equals(socket.user._id)) return;

      if (action === 'like') {
        const notification = await createNotification(
          'like_reel',
          reel.user._id,
          socket.user._id,
          { reel: reelId }
        );
        io.to(reel.user._id.toString()).emit('new_notification', notification);
      }
    });

    // Comment notifications
    socket.on('comment_added', async ({ postId, commentId }) => {
      const post = await Post.findById(postId).populate('user');
      if (!post || post.user._id.equals(socket.user._id)) return;

      const notification = await createNotification(
        'comment_post',
        post.user._id,
        socket.user._id,
        { post: postId }
      );
      io.to(post.user._id.toString()).emit('new_notification', notification);
    });

    // Follow notifications
    socket.on('user_followed', async ({ targetUserId }) => {
      if (targetUserId === socket.user._id.toString()) return;

      const notification = await createNotification(
        'follow',
        targetUserId,
        socket.user._id
      );
      io.to(targetUserId).emit('new_notification', notification);
    });

    // Story reaction
    socket.on('story_reacted', async ({ storyId, emoji }) => {
      const story = await Story.findById(storyId).populate('user');
      if (!story || story.user._id.equals(socket.user._id)) return;

      const notification = await createNotification(
        'story_react',
        story.user._id,
        socket.user._id,
        { 
          story: storyId,
          emoji 
        }
      );
      io.to(story.user._id.toString()).emit('new_notification', notification);
    });

    // Notification read/clear
    socket.on('notifications_read', async ({ notificationIds }) => {
      await Notification.updateMany(
        { _id: { $in: notificationIds } },
        { isRead: true }
      );
      
      socket.emit('notifications_cleared');
    });
  });
};
