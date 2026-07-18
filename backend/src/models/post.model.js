import mongoose from "mongoose";

const { Schema } = mongoose;

const mediaSchema = new Schema(
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

const postSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Post user is required"],
    },
    caption: {
      type: String,
      trim: true,
      maxlength: [2200, "Caption cannot exceed 2200 characters"],
      default: "",
    },
    media: {
      type: [mediaSchema],
      default: [],
      validate: {
        validator: function (value) {
          return Array.isArray(value);
        },
        message: "Media must be an array",
      },
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    topComments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    saves: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

postSchema.pre("validate", function (next) {
  const hasCaption = this.caption && this.caption.trim().length > 0;
  const hasMedia = Array.isArray(this.media) && this.media.length > 0;

  if (!hasCaption && !hasMedia) {
    return next(new Error("Post must contain either caption or media."));
  }

  next();
});

postSchema.path("likes").validate(function (value) {
  if (!Array.isArray(value)) return true;
  const ids = value.map((id) => id.toString());
  return ids.length === new Set(ids).size;
}, "Duplicate likes are not allowed.");

postSchema.path("saves").validate(function (value) {
  if (!Array.isArray(value)) return true;
  const ids = value.map((id) => id.toString());
  return ids.length === new Set(ids).size;
}, "Duplicate saves are not allowed.");

postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ likes: 1 });
postSchema.index({ commentsCount: -1, createdAt: -1 });

export const Post = mongoose.model("Post", postSchema);