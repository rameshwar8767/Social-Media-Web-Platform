import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    /* AUTH */
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    full_name: {
      type: String,
      required: true,
      trim: true,
    },

    /* PROFILE */
    bio: {
      type: String,
      default: "",
      maxlength: 160, // Instagram-like bio limit
    },

    profile_picture: {
      type: String,
      default: "https://placehold.co/400",
    },

    cover_photo: {
      type: String,
      default: "https://placehold.co/1200x400",
    },

    location: {
      type: String,
      default: "",
    },

    /* SOCIAL GRAPH */
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    connections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    /* ACCOUNT STATUS */
    isVerified: {
      type: Boolean,
      default: false,
    },

    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", userSchema);
