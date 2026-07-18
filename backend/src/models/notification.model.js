import mongoose from "mongoose";

const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipient is required"],
      index: true,
    },
    type: {
      type: String,
      enum: [
        "like_post",
        "like_reel",
        "comment_post",
        "comment_reel",
        "follow",
        "story_react",
        "chat_message",
      ],
      required: [true, "Notification type is required"],
    },
    relatedUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Related user is required"],
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },
    reel: {
      type: Schema.Types.ObjectId,
      ref: "Reel",
      default: null,
    },
    story: {
      type: Schema.Types.ObjectId,
      ref: "Story",
      default: null,
    },
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    message: {
      type: String,
      trim: true,
      maxlength: [300, "Notification message cannot exceed 300 characters"],
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

notificationSchema.pre("validate", function (next) {
  const { type, post, reel, story, chatId } = this;

  if (type === "like_post" || type === "comment_post") {
    if (!post) {
      return next(new Error(`${type} notification requires post`));
    }
  }

  if (type === "like_reel" || type === "comment_reel") {
    if (!reel) {
      return next(new Error(`${type} notification requires reel`));
    }
  }

  if (type === "story_react") {
    if (!story) {
      return next(new Error("story_react notification requires story"));
    }
  }

  if (type === "chat_message") {
    if (!chatId) {
      return next(new Error("chat_message notification requires chatId"));
    }
  }

  next();
});

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model("Notification", notificationSchema);