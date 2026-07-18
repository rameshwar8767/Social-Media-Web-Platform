import { getIO } from "../sockets/index.js";
import { Notification } from "../models/notification.model.js";

export const createNotification = async (
  type,
  recipientId,
  actorId,
  relatedData = {}
) => {
  const notification = await Notification.create({
    recipient: recipientId,
    type,
    relatedUser: actorId,
    ...relatedData,
  });

  const populatedNotification = await Notification.findById(notification._id)
    .populate("relatedUser", "username profile_picture full_name")
    .populate("post", "caption media")
    .populate("user", "username profile_picture full_name")
    .lean();

  try {
    const io = getIO();
    if (io) {
      io.to(String(recipientId)).emit("new_notification", populatedNotification);
    }
  } catch (error) {
    console.warn("Socket notification emit failed:", error.message);
  }

  return populatedNotification;
};

export const markNotificationsRead = async (userId, notificationIds = []) => {
  if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
    return {
      matchedCount: 0,
      modifiedCount: 0,
    };
  }

  const result = await Notification.updateMany(
    {
      _id: { $in: notificationIds },
      recipient: userId,
      isRead: false,
    },
    {
      $set: { isRead: true },
    }
  );

  return {
    matchedCount: result.matchedCount ?? result.n ?? 0,
    modifiedCount: result.modifiedCount ?? result.nModified ?? 0,
  };
};