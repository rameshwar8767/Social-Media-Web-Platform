import mongoose from "mongoose";

const { Schema } = mongoose;

const assetSchema = new Schema(
  {
    url: {
      type: String,
      required: [true, "Asset URL is required"],
      trim: true,
    },
    public_id: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { _id: false }
);

const reelSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reel user is required"],
    },
    caption: {
      type: String,
      trim: true,
      maxlength: [2200, "Caption cannot exceed 2200 characters"],
      default: "",
    },
    video: {
      type: new Schema(
        {
          url: {
            type: String,
            required: [true, "Video URL is required"],
            trim: true,
          },
          public_id: {
            type: String,
            trim: true,
            default: null,
          },
          duration: {
            type: Number,
            min: 0,
            default: 0,
          },
        },
        { _id: false }
      ),
      required: true,
    },
    thumbnail: {
      type: assetSchema,
      default: null,
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
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    shares: {
      type: Number,
      default: 0,
      min: 0,
    },
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

reelSchema.path("likes").validate(function (value) {
  if (!Array.isArray(value)) return true;
  const ids = value.map((id) => id.toString());
  return ids.length === new Set(ids).size;
}, "Duplicate likes are not allowed.");

reelSchema.path("saves").validate(function (value) {
  if (!Array.isArray(value)) return true;
  const ids = value.map((id) => id.toString());
  return ids.length === new Set(ids).size;
}, "Duplicate saves are not allowed.");

reelSchema.index({ user: 1, createdAt: -1 });
reelSchema.index({ views: -1, createdAt: -1 });
reelSchema.index({ commentsCount: -1, createdAt: -1 });

export const Reel = mongoose.model("Reel", reelSchema);