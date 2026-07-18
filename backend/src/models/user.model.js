import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [/^[a-z0-9._]+$/, "Username can only contain lowercase letters, numbers, dots, and underscores"],
    },
    full_name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [60, "Full name cannot exceed 60 characters"],
    },

    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: [160, "Bio cannot exceed 160 characters"],
    },
    profile_picture: {
      type: String,
      default: "https://placehold.co/400",
      trim: true,
    },
    cover_photo: {
      type: String,
      default: "https://placehold.co/1200x400",
      trim: true,
    },
    location: {
      type: String,
      default: "",
      trim: true,
      maxlength: [100, "Location cannot exceed 100 characters"],
    },

    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    isVerified: {
      type: Boolean,
      default: false,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: {
      type: String,
      select: false,
      default: undefined,
    },
    emailVerificationTokenExpiry: {
      type: Date,
      default: undefined,
    },

    forgotPasswordToken: {
      type: String,
      select: false,
      default: undefined,
    },
    forgotPasswordTokenExpiry: {
      type: Date,
      default: undefined,
    },

    refreshToken: {
      type: String,
      select: false,
      default: undefined,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }

    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.path("followers").validate(function (value) {
  if (!Array.isArray(value)) return true;
  const ids = value.map((id) => id.toString());
  return ids.length === new Set(ids).size;
}, "Duplicate followers are not allowed.");

userSchema.path("following").validate(function (value) {
  if (!Array.isArray(value)) return true;
  const ids = value.map((id) => id.toString());
  return ids.length === new Set(ids).size;
}, "Duplicate following users are not allowed.");

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d",
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
    }
  );
};

userSchema.methods.generateTemporaryToken = function () {
  const unHashedToken = crypto.randomBytes(20).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");

  const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

  return {
    unHashedToken,
    hashedToken,
    tokenExpiry,
  };
};

userSchema.methods.generateEmailVerificationToken = async function () {
  const { unHashedToken, hashedToken, tokenExpiry } =
    this.generateTemporaryToken();

  this.emailVerificationToken = hashedToken;
  this.emailVerificationTokenExpiry = tokenExpiry;

  await this.save({ validateBeforeSave: false });

  return unHashedToken;
};

userSchema.methods.generateForgotPasswordToken = async function () {
  const { unHashedToken, hashedToken, tokenExpiry } =
    this.generateTemporaryToken();

  this.forgotPasswordToken = hashedToken;
  this.forgotPasswordTokenExpiry = tokenExpiry;

  await this.save({ validateBeforeSave: false });

  return unHashedToken;
};

userSchema.methods.clearForgotPasswordToken = function () {
  this.forgotPasswordToken = undefined;
  this.forgotPasswordTokenExpiry = undefined;
  return this.save({ validateBeforeSave: false });
};

userSchema.methods.clearEmailVerificationToken = function () {
  this.emailVerificationToken = undefined;
  this.emailVerificationTokenExpiry = undefined;
  return this.save({ validateBeforeSave: false });
};

export const User = mongoose.model("User", userSchema);