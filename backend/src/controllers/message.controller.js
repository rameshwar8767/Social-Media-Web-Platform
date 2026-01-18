import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import Notification from "../models/notification.model.js";
import { sendNotification } from "../sockets/socket.js";

export const sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;

    // find or create conversation
    let conversation = await Conversation.findOne({
      members: { $all: [req.user._id, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        members: [req.user._id, receiverId],
      });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      receiver: receiverId,
      text,
    });

    conversation.lastMessage = message._id;
    await conversation.save();

    // 🔔 CREATE MESSAGE NOTIFICATION
    const notification = await Notification.create({
      recipient: receiverId,
      sender: req.user._id,
      type: "message",
      conversation: conversation._id,
    });

    // 🔔 REAL-TIME PUSH
    sendNotification(receiverId, {
      type: "message",
      sender: req.user,
      text,
      conversationId: conversation._id,
    });

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markMessagesAsSeen = async (req, res) => {
  try {
    const { conversationId } = req.params;

    await Message.updateMany(
      {
        conversation: conversationId,
        receiver: req.user._id,
        isSeen: false,
      },
      { isSeen: true }
    );

    res.status(200).json({
      success: true,
      message: "Messages marked as seen",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

