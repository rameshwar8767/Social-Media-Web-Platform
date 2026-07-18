import mongoose from "mongoose";

const { Schema } = mongoose;

const commentSchema = new Schema(
  {
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
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Comment user is required"],
    },
    text: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

commentSchema.path("text").validate(function (value) {
  return typeof value === "string" && value.trim().length > 0;
}, "Comment text cannot be empty.");

commentSchema.pre("validate", function (next) {
  const hasPost = !!this.post;
  const hasReel = !!this.reel;

  if ((hasPost && hasReel) || (!hasPost && !hasReel)) {
    return next(
      new Error("Comment must belong to either a post or a reel, but not both.")
    );
  }

  next();
});

commentSchema.path("likes").validate(function (value) {
  if (!Array.isArray(value)) return true;
  const ids = value.map((id) => id.toString());
  return ids.length === new Set(ids).size;
}, "Duplicate likes are not allowed.");

commentSchema.path("replies").validate(function (value) {
  if (!Array.isArray(value)) return true;
  const ids = value.map((id) => id.toString());
  return ids.length === new Set(ids).size;
}, "Duplicate replies are not allowed.");

commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ reel: 1, createdAt: -1 });
commentSchema.index({ user: 1 });
commentSchema.index({ parentComment: 1, createdAt: 1 });

export const Comment = mongoose.model("Comment", commentSchema);