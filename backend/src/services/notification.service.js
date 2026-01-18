import { getIO } from '../sockets/index.js';
import { Notification } from '../models/notification.model.js';
import { User } from '../models/user.model.js';

export const createNotification = async (type, recipientId, actorId, relatedData = {}) => {
  const notification = await Notification.create({
    recipient: recipientId,
    type,
    relatedUser: actorId,
    ...relatedData
  });

  const populated = await Notification.findById(notification._id)
    .populate('relatedUser', 'username profile_picture full_name')
    .populate('post user', 'caption media')
    .lean();

  // Real-time push
  const io = getIO();
  io.to(recipientId.toString()).emit('new_notification', populated);

  return populated;
};

export const markNotificationsRead = async (userId, notificationIds) => {
  await Notification.updateMany(
    { _id: { $in: notificationIds }, recipient: userId },
    { isRead: true }
  );
};
