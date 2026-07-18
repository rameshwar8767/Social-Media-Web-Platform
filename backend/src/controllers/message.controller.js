import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";
import { Notification } from "../models/notification.model.js";
import { sendNotification } from "../sockets/socket.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const isUserParticipant = (chat, userId) => {
  return chat.participants.some(
    (participantId) => String(participantId) === String(userId)
  );
};

export const sendMessage = asyncHandler(async (req, res) => {
  const { chatId, content } = req.body;

  if (!chatId || !isValidObjectId(chatId)) {
    throw new ApiError(400, "Valid chatId is required");
  }

  if (!content || !content.trim()) {
    throw new ApiError(400, "Message content is required");
  }

  const chat = await Chat.findById(chatId).select("participants");
  if (!chat) {
    throw new ApiError(404, "Chat not found");
  }

  if (!isUserParticipant(chat, req.user._id)) {
    throw new ApiError(403, "You are not a participant of this chat");
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

  const receiverIds = chat.participants.filter(
    (participantId) => String(participantId) !== String(req.user._id)
  );

  if (receiverIds.length > 0) {
    await Promise.all(
      receiverIds.map(async (receiverId) => {
        try {
          if (Notification) {
            await Notification.create({
              recipient: receiverId,
              sender: req.user._id,
              type: "message",
              chat: chatId,
              message: message._id,
            });
          }

          await sendNotification?.(String(receiverId), {
            type: "message",
            chatId,
            messageId: message._id,
            sender: {
              _id: req.user._id,
              username: req.user.username,
              full_name: req.user.full_name,
              profile_picture: req.user.profile_picture,
            },
            content: message.content,
          });
        } catch (err) {
          console.error("Notification dispatch failed:", err.message);
        }
      })
    );
  }

  const populatedMessage = await Message.findById(message._id)
    .populate("sender", "username full_name profile_picture")
    .lean();

  return res
    .status(201)
    .json(new ApiResponse(201, populatedMessage, "Message sent successfully"));
});

export const markMessagesAsSeen = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  if (!chatId || !isValidObjectId(chatId)) {
    throw new ApiError(400, "Valid chatId is required");
  }

  const chat = await Chat.findById(chatId).select("participants unreadCount");
  if (!chat) {
    throw new ApiError(404, "Chat not found");
  }

  if (!isUserParticipant(chat, req.user._id)) {
    throw new ApiError(403, "You are not a participant of this chat");
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
    .json(new ApiResponse(200, null, "Messages marked as seen"));
});