import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Notification } from "../models/notification.model.js";
import { getIO } from "../sockets/socket.js";

const getUserNotifications = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);
  const read = req.query.read;
  const skip = (page - 1) * limit;

  const query = {
    recipient: req.user._id,
    ...(read === "true" ? { isRead: true } : {}),
    ...(read === "false" ? { isRead: false } : {}),
  };

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .populate("relatedUser", "username profile_picture full_name")
      .populate("post", "caption media")
      .populate("reel", "video")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(query),
    Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        notifications,
        unreadCount,
        pagination: {
          page,
          limit,
          total,
          hasMore: skip + notifications.length < total,
        },
      },
      "Notifications fetched successfully"
    )
  );
});

const markAllRead = asyncHandler(async (req, res) => {
  const now = new Date();

  const result = await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    {
      $set: {
        isRead: true,
        readAt: now,
      },
    }
  );

  try {
    const io = getIO();
    io.to(req.user._id.toString()).emit("notifications_read", {
      count: result.modifiedCount,
    });
  } catch (error) {
    console.error("Socket emit failed:", error.message);
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        readCount: result.modifiedCount,
      },
      "All notifications marked as read"
    )
  );
});

export { getUserNotifications, markAllRead };