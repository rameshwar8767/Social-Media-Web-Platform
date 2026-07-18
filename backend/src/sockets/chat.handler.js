import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";
import { uploadChatMedia } from "../services/cloudinary.service.js";

const withSocketErrorHandler = (socket, handler) => {
  return async (...args) => {
    try {
      await handler(...args);
    } catch (error) {
      socket.emit("chat_error", {
        message: error.message || "Something went wrong",
      });
    }
  };
};

export const handleChatEvents = (socket, io) => {
  socket.on(
    "create_chat",
    withSocketErrorHandler(socket, async ({ recipientId }) => {
      if (!recipientId) {
        throw new Error("recipientId is required");
      }

      let chat = await Chat.findOne({
        participants: { $all: [socket.user._id, recipientId], $size: 2 },
      });

      if (!chat) {
        chat = await Chat.create({
          participants: [socket.user._id, recipientId],
        });
      }

      socket.chatId = chat._id.toString();
      socket.join(chat._id.toString());

      socket.emit("chat_created", { chatId: chat._id });
    })
  );

  socket.on(
    "join_chat",
    withSocketErrorHandler(socket, async ({ chatId }) => {
      if (!chatId) {
        throw new Error("chatId is required");
      }

      const chat = await Chat.findOne({
        _id: chatId,
        participants: socket.user._id,
      });

      if (!chat) {
        throw new Error("Chat not found or access denied");
      }

      socket.join(chatId.toString());
      socket.emit("chat_joined", { chatId });
    })
  );

  socket.on(
    "send_message",
    withSocketErrorHandler(socket, async ({ chatId, content, media }) => {
      if (!chatId) {
        throw new Error("chatId is required");
      }

      if (!content && !media) {
        throw new Error("Message content or media is required");
      }

      const chat = await Chat.findOne({
        _id: chatId,
        participants: socket.user._id,
      });

      if (!chat) {
        throw new Error("Chat not found or access denied");
      }

      const messageData = {
        chatId,
        sender: socket.user._id,
        content: content?.trim() || "",
      };

      if (media?.path) {
        const uploadResult = await uploadChatMedia(media.path);

        messageData.media = {
          url: uploadResult.url,
          public_id: uploadResult.public_id,
          type: media.type || uploadResult.resource_type || "file",
        };
      }

      let message = await Message.create(messageData);

      message = await message.populate("sender", "username profile_picture");

      const recipientIds = (chat.participants || [])
        .map((id) => id.toString())
        .filter((id) => id !== socket.user._id.toString());

      const unreadUpdates = {};
      recipientIds.forEach((recipientId) => {
        unreadUpdates[`unreadCount.${recipientId}`] = 1;
      });

      await Chat.findByIdAndUpdate(chatId, {
        lastMessage: message._id,
        ...(Object.keys(unreadUpdates).length > 0 && {
          $inc: unreadUpdates,
        }),
      });

      io.to(chatId.toString()).emit("receive_message", {
        message,
        chatId,
      });
    })
  );

  socket.on(
    "typing",
    withSocketErrorHandler(socket, async ({ chatId, isTyping }) => {
      if (!chatId) {
        throw new Error("chatId is required");
      }

      const chat = await Chat.findOne({
        _id: chatId,
        participants: socket.user._id,
      }).select("_id");

      if (!chat) {
        throw new Error("Chat not found or access denied");
      }

      socket.to(chatId.toString()).emit("user_typing", {
        userId: socket.user._id,
        username: socket.user.username,
        isTyping: Boolean(isTyping),
      });
    })
  );

  socket.on(
    "message_read",
    withSocketErrorHandler(socket, async ({ chatId, messageId }) => {
      if (!chatId || !messageId) {
        throw new Error("chatId and messageId are required");
      }

      const chat = await Chat.findOne({
        _id: chatId,
        participants: socket.user._id,
      });

      if (!chat) {
        throw new Error("Chat not found or access denied");
      }

      await Message.findOneAndUpdate(
        {
          _id: messageId,
          chatId,
        },
        {
          isRead: true,
        }
      );

      await Chat.findByIdAndUpdate(chatId, {
        $set: {
          [`unreadCount.${socket.user._id}`]: 0,
        },
      });

      io.to(chatId.toString()).emit("message_read", {
        messageId,
        chatId,
        userId: socket.user._id,
      });
    })
  );
};