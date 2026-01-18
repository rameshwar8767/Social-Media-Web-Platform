import { Chat } from '../models/chat.model.js';
import { Message } from '../models/message.model.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

export const handleChatEvents = (socket, io) => {
  // Create/find chat room
  socket.on('create_chat', async ({ recipientId }) => {
    let chat = await Chat.findOne({
      participants: { $all: [socket.user._id, recipientId], $size: 2 }
    });

    if (!chat) {
      chat = await Chat.create({
        participants: [socket.user._id, recipientId]
      });
    }

    socket.chatId = chat._id;
    socket.join(chat._id.toString());
    socket.emit('chat_created', { chatId: chat._id });
  });

  // Send message
  socket.on('send_message', async ({ chatId, content, media }) => {
    let messageData = { chatId, sender: socket.user._id, content };

    // Handle media
    if (media) {
      const result = await uploadToCloudinary(media.path);
      messageData.media = {
        url: result.secure_url,
        public_id: result.public_id,
        type: media.type
      };
      fs.unlinkSync(media.path);
    }

    const message = await Message.create(messageData);
    
    // Update chat lastMessage
    await Chat.findByIdAndUpdate(chatId, { 
      lastMessage: message._id,
      $inc: { [`unreadCount.${socket.user._id}`]: 1 }
    });

    // Broadcast to chat room
    io.to(chatId).emit('receive_message', {
      message: await message.populate('sender', 'username profile_picture'),
      chatId
    });
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
  socket.on('message_read', async ({ chatId, messageId }) => {
    await Message.findByIdAndUpdate(messageId, { isRead: true });
    io.to(chatId).emit('message_read', { messageId });
  });
};
