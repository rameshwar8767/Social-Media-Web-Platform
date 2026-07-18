import fs from "fs";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

const isUserParticipant = (chat, userId) => {
  return chat.participants.some(
    (participantId) => String(participantId) === String(userId)
  );
};

export const getUserChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({ participants: req.user._id })
    .populate("participants", "username profile_picture full_name")
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: "username profile_picture full_name",
      },
    })
    .sort({ updatedAt: -1 })
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(200, chats, "Chats fetched successfully"));
});

export const getChatMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new ApiError(400, "Invalid chat id");
  }

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
  const skip = (page - 1) * limit;

  const chat = await Chat.findById(chatId).select("participants");
  if (!chat) {
    throw new ApiError(404, "Chat not found");
  }

  if (!isUserParticipant(chat, req.user._id)) {
    throw new ApiError(403, "Access denied to this chat");
  }

  const messages = await Message.find({ chatId })
    .populate("sender", "username profile_picture full_name")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        messages: messages.reverse(),
        pagination: {
          page,
          limit,
          hasMore: messages.length === limit,
        },
      },
      "Messages fetched successfully"
    )
  );
});

export const sendTextMessage = asyncHandler(async (req, res) => {
  const { chatId, content } = req.body;

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new ApiError(400, "Invalid chat id");
  }

  if (!content || !content.trim()) {
    throw new ApiError(400, "Message content is required");
  }

  const chat = await Chat.findById(chatId).select("participants");
  if (!chat) {
    throw new ApiError(404, "Chat not found");
  }

  if (!isUserParticipant(chat, req.user._id)) {
    throw new ApiError(403, "Access denied to this chat");
  }

  const message = await Message.create({
    chatId,
    sender: req.user._id,
    content: content.trim(),
    messageType: "text",
  });

  await Chat.findByIdAndUpdate(chatId, {
    lastMessage: message._id,
    updatedAt: new Date(),
  });

  const populatedMessage = await Message.findById(message._id)
    .populate("sender", "username profile_picture full_name")
    .lean();

  return res
    .status(201)
    .json(new ApiResponse(201, populatedMessage, "Message sent successfully"));
});

export const markMessagesRead = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new ApiError(400, "Invalid chat id");
  }

  const chat = await Chat.findById(chatId).select("participants unreadCount");
  if (!chat) {
    throw new ApiError(404, "Chat not found");
  }

  if (!isUserParticipant(chat, req.user._id)) {
    throw new ApiError(403, "Access denied to this chat");
  }

  await Message.updateMany(
    {
      chatId,
      sender: { $ne: req.user._id },
      "readBy.user": { $ne: req.user._id },
    },
    {
      $set: { isRead: true },
      $addToSet: {
        readBy: {
          user: req.user._id,
          readAt: new Date(),
        },
      },
    }
  );

  if (chat.unreadCount) {
    chat.unreadCount.set(String(req.user._id), 0);
    await chat.save();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Messages marked as read"));
});