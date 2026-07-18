import { Notification } from "../models/notification.model.js";
import { Post } from "../models/post.model.js";
import { Reel } from "../models/reel.model.js";
import { Story } from "../models/story.model.js";
import { createNotification, markNotificationsRead } from "../services/notification.service.js";

const withSocketErrorHandler = (socket, handler) => {
  return async (...args) => {
    try {
      await handler(...args);
    } catch (error) {
      socket.emit("notification_error", {
        message: error.message || "Notification event failed",
      });
    }
  };
};

export const handleNotificationEvents = (socket, io) => {
  socket.on(
    "post_liked",
    withSocketErrorHandler(socket, async ({ postId, action }) => {
      if (action !== "like" || !postId) return;

      const post = await Post.findById(postId).select("user");
      if (!post || post.user?.toString() === socket.user._id.toString()) return;

      await createNotification("like_post", post.user, socket.user._id, {
        post: postId,
      });
    })
  );

  socket.on(
    "reel_liked",
    withSocketErrorHandler(socket, async ({ reelId, action }) => {
      if (action !== "like" || !reelId) return;

      const reel = await Reel.findById(reelId).select("user");
      if (!reel || reel.user?.toString() === socket.user._id.toString()) return;

      await createNotification("like_reel", reel.user, socket.user._id, {
        reel: reelId,
      });
    })
  );

  socket.on(
    "comment_added",
    withSocketErrorHandler(socket, async ({ postId, commentId }) => {
      if (!postId || !commentId) return;

      const post = await Post.findById(postId).select("user");
      if (!post || post.user?.toString() === socket.user._id.toString()) return;

      await createNotification("comment_post", post.user, socket.user._id, {
        post: postId,
        comment: commentId,
      });
    })
  );

  socket.on(
    "user_followed",
    withSocketErrorHandler(socket, async ({ targetUserId }) => {
      if (!targetUserId) return;
      if (targetUserId === socket.user._id.toString()) return;

      await createNotification("follow", targetUserId, socket.user._id);
    })
  );

  socket.on(
    "story_reacted",
    withSocketErrorHandler(socket, async ({ storyId, emoji }) => {
      if (!storyId || !emoji) return;

      const story = await Story.findById(storyId).select("user");
      if (!story || story.user?.toString() === socket.user._id.toString()) return;

      await createNotification("story_react", story.user, socket.user._id, {
        story: storyId,
        emoji,
      });
    })
  );

  socket.on(
    "notifications_read",
    withSocketErrorHandler(socket, async ({ notificationIds = [] }) => {
      const result = await markNotificationsRead(socket.user._id, notificationIds);

      socket.emit("notifications_marked_read", result);
    })
  );

  socket.on(
    "notifications_clear_all",
    withSocketErrorHandler(socket, async () => {
      const result = await Notification.updateMany(
        {
          recipient: socket.user._id,
          isRead: false,
        },
        {
          $set: { isRead: true },
        }
      );

      socket.emit("notifications_marked_read", {
        matchedCount: result.matchedCount ?? result.n ?? 0,
        modifiedCount: result.modifiedCount ?? result.nModified ?? 0,
      });
    })
  );
};