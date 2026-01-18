import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { Notification } from '../models/notification.model.js';
import { markNotificationsRead } from '../services/notification.service.js';

const getUserNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, read = null } = req.query;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ 
    recipient: req.user._id,
    ...(read !== null && { isRead: read === 'true' })
  })
    .populate('relatedUser', 'username profile_picture full_name')
    .populate('post', 'caption media')
    .populate('reel', 'video')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Notification.countDocuments({ recipient: req.user._id });

  res.json(new ApiResponse(200, {
    notifications,
    unreadCount: await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    }),
    page: Number(page),
    hasMore: skip + notifications.length < total
  }));
});

const markAllRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true }
  );

  // Socket broadcast
  const io = getIO();
  io.to(req.user._id.toString()).emit('notifications_read', { 
    count: result.modifiedCount 
  });

  res.json(new ApiResponse(200, { 
    readCount: result.modifiedCount,
    message: 'All notifications marked read'
  }));
});

export { getUserNotifications, markAllRead };
