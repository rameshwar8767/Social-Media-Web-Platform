import mongoose from "mongoose";

const { Schema } = mongoose;

const storyMediaSchema = new Schema(
  {
    url: {
      type: String,
      required: [true, "Media URL is required"],
      trim: true,
    },
    public_id: {
      type: String,
      trim: true,
      default: null,
    },
    type: {
      type: String,
      enum: ["image", "video"],
      required: [true, "Media type is required"],
    },
  },
  { _id: false }
);

const storyViewerSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const storyReactionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    emoji: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const storySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Story user is required"],
    },
    media: {
      type: [storyMediaSchema],
      required: true,
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length > 0 && value.length <= 10;
        },
        message: "Story must contain between 1 and 10 media items",
      },
    },
    caption: {
      type: String,
      trim: true,
      maxlength: [500, "Caption cannot exceed 500 characters"],
      default: "",
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: 0,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    viewers: {
      type: [storyViewerSchema],
      default: [],
    },
    reactions: {
      type: [storyReactionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

storySchema.path("viewers").validate(function (value) {
  if (!Array.isArray(value)) return true;
  const ids = value.map((item) => item.user?.toString()).filter(Boolean);
  return ids.length === new Set(ids).size;
}, "Duplicate viewers are not allowed.");

storySchema.index({ user: 1, createdAt: -1 });
storySchema.index({ expiresAt: 1 });

export const Story = mongoose.model("Story", storySchema);