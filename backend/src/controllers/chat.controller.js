import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { Chat } from '../models/chat.model.js';
import { Message } from '../models/message.model.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import fs from 'fs';

export const getUserChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({ participants: req.user._id })
    .populate('participants', 'username profile_picture full_name')
    .populate({
      path: 'lastMessage',
      populate: { 
        path: 'sender', 
        select: 'username profile_picture' 
      }
    })
    .sort({ updatedAt: -1 })
    .lean();

  res.json(new ApiResponse(200, chats));
});

export const getChatMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const skip = (page - 1) * limit;
  
  const messages = await Message.find({ chatId })
    .populate('sender', 'username profile_picture full_name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.json(new ApiResponse(200, messages.reverse()));  // Oldest first
});

// ✅ MISSING CONTROLLER ADDED
export const sendTextMessage = asyncHandler(async (req, res) => {
  const { chatId, content } = req.body;
  
  if (!content?.trim()) {
    throw new ApiError(400, 'Message content required');
  }

  const chat = await Chat.findById(chatId);
  if (!chat || !chat.participants.includes(req.user._id)) {
    throw new ApiError(403, 'Access denied to chat');
  }

  const message = await Message.create({
    chatId,
    sender: req.user._id,
    content: content.trim(),
    messageType: 'text'
  });

  // Update chat
  chat.lastMessage = message._id;
  await chat.save();

  const populatedMessage = await Message.findById(message._id)
    .populate('sender', 'username profile_picture full_name');

  res.status(201).json(
    new ApiResponse(201, populatedMessage, 'Message sent')
  );
});

// Bonus: Mark messages as read
export const markMessagesRead = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  
  await Message.updateMany(
    { chatId, sender: { $ne: req.user._id } },
    { isRead: true, $push: { readBy: { user: req.user._id, readAt: new Date() } } }
  );

  res.json(new ApiResponse(200, null, 'Messages marked read'));
});
