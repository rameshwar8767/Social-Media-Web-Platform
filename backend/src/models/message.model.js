import mongoose from "mongoose";

const { Schema } = mongoose;

const readBySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    readAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const mediaSchema = new Schema(
  {
    url: {
      type: String,
      trim: true,
      default: null,
    },
    public_id: {
      type: String,
      trim: true,
      default: null,
    },
    type: {
      type: String,
      enum: ["image", "video", "audio"],
      default: null,
    },
  },
  { _id: false }
);

const messageSchema = new Schema(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: [true, "Chat id is required"],
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
    },
    content: {
      type: String,
      trim: true,
      maxlength: [2000, "Message content cannot exceed 2000 characters"],
      default: null,
    },
    media: {
      type: mediaSchema,
      default: null,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "video", "audio"],
      default: "text",
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readBy: {
      type: [readBySchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

messageSchema.path("content").validate(function (value) {
  if (this.messageType !== "text") return true;
  return typeof value === "string" && value.trim().length > 0;
}, "Text messages must have content.");

messageSchema.pre("validate", function (next) {
  if (this.messageType === "text") {
    if (this.media?.url || this.media?.public_id || this.media?.type) {
      return next(new Error("Text messages should not include media."));
    }
  }

  if (["image", "video", "audio"].includes(this.messageType)) {
    if (!this.media || !this.media.url || !this.media.type) {
      return next(new Error("Media messages must include media url and media type."));
    }

    if (this.media.type !== this.messageType) {
      return next(new Error("media.type must match messageType."));
    }
  }

  next();
});

messageSchema.path("readBy").validate(function (value) {
  if (!Array.isArray(value)) return true;
  const userIds = value.map((entry) => entry.user?.toString()).filter(Boolean);
  return userIds.length === new Set(userIds).size;
}, "Duplicate readBy users are not allowed.");

messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });

export const Message = mongoose.model("Message", messageSchema);