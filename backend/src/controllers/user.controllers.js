import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const escapeRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const sanitizeUser = (user) => {
  if (!user) return null;

  const plainUser =
    typeof user.toObject === "function" ? user.toObject() : { ...user };

  delete plainUser.password;
  delete plainUser.refreshToken;
  delete plainUser.emailVerificationToken;
  delete plainUser.emailVerificationTokenExpiry;
  delete plainUser.forgotPasswordToken;
  delete plainUser.forgotPasswordTokenExpiry;

  return {
    ...plainUser,
    followersCount: Array.isArray(plainUser.followers)
      ? plainUser.followers.length
      : 0,
    followingCount: Array.isArray(plainUser.following)
      ? plainUser.following.length
      : 0,
  };
};

const getUserProfile = asyncHandler(async (req, res) => {
  const username = req.params.username?.trim().toLowerCase();

  if (!username) {
    throw new ApiError(400, "Username is required");
  }

  const user = await User.findOne({ username })
    .select("-password -refreshToken -emailVerificationToken -forgotPasswordToken")
    .populate("followers", "username full_name profile_picture")
    .populate("following", "username full_name profile_picture");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isOwner = String(req.user._id) === String(user._id);
  const isFollower = (req.user.following || []).some(
    (id) => String(id) === String(user._id)
  );

  if (user.isPrivate && !isOwner && !isFollower) {
    throw new ApiError(403, "Private profile - follow to view");
  }

  return res.status(200).json(
    new ApiResponse(200, sanitizeUser(user), "Profile fetched successfully")
  );
});

const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("-password -refreshToken -emailVerificationToken -forgotPasswordToken")
    .populate("followers", "username full_name profile_picture")
    .populate("following", "username full_name profile_picture");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(200, sanitizeUser(user), "Your profile fetched successfully")
  );
});

const searchUsers = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
  const q = req.query.q?.trim();

  if (!q || q.length < 2) {
    throw new ApiError(400, "Query must be at least 2 characters long");
  }

  const skip = (page - 1) * limit;
  const safeRegex = new RegExp(escapeRegex(q), "i");

  const query = {
    $or: [{ username: safeRegex }, { full_name: safeRegex }],
    _id: { $ne: req.user._id },
  };

  const [users, total] = await Promise.all([
    User.find(query)
      .select("username full_name profile_picture bio followers following isPrivate")
      .limit(limit)
      .skip(skip)
      .lean(),
    User.countDocuments(query),
  ]);

  const normalizedUsers = users.map((user) => ({
    ...user,
    followersCount: Array.isArray(user.followers) ? user.followers.length : 0,
    followingCount: Array.isArray(user.following) ? user.following.length : 0,
  }));

  return res.status(200).json(
    new ApiResponse(200, {
      users: normalizedUsers,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + users.length < total,
      },
    }, "Users fetched successfully")
  );
});

const updateProfile = asyncHandler(async (req, res) => {
  const updates = {};

  if (req.body.full_name !== undefined) {
    updates.full_name = req.body.full_name.trim();
  }

  if (req.body.bio !== undefined) {
    updates.bio = req.body.bio.trim();
  }

  if (req.body.location !== undefined) {
    updates.location = req.body.location.trim();
  }

  if (req.body.profile_picture !== undefined) {
    updates.profile_picture = req.body.profile_picture.trim();
  }

  if (req.body.cover_photo !== undefined) {
    updates.cover_photo = req.body.cover_photo.trim();
  }

  if (req.body.username !== undefined) {
    const normalizedUsername = req.body.username.trim().toLowerCase();

    if (normalizedUsername !== req.user.username) {
      const existingUser = await User.findOne({ username: normalizedUsername });
      if (existingUser) {
        throw new ApiError(400, "Username already taken");
      }
    }

    updates.username = normalizedUsername;
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No valid fields provided for update");
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).select("-password -refreshToken -emailVerificationToken -forgotPasswordToken");

  return res.status(200).json(
    new ApiResponse(200, sanitizeUser(user), "Profile updated successfully")
  );
});

const updateProfilePrivacy = asyncHandler(async (req, res) => {
  const { isPrivate } = req.body;

  if (typeof isPrivate !== "boolean") {
    throw new ApiError(400, "isPrivate must be a boolean");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { isPrivate },
    { new: true, runValidators: true }
  ).select("-password -refreshToken -emailVerificationToken -forgotPasswordToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(200, sanitizeUser(user), "Privacy updated successfully")
  );
});

const toggleFollow = asyncHandler(async (req, res) => {
  const targetId = req.params.id || req.params.targetId;

  if (!isValidObjectId(targetId)) {
    throw new ApiError(400, "Invalid target user id");
  }

  if (String(targetId) === String(req.user._id)) {
    throw new ApiError(400, "You cannot follow yourself");
  }

  const [currentUser, targetUser] = await Promise.all([
    User.findById(req.user._id),
    User.findById(targetId),
  ]);

  if (!currentUser || !targetUser) {
    throw new ApiError(404, "User not found");
  }

  const isFollowing = currentUser.following.some(
    (id) => String(id) === String(targetUser._id)
  );

  if (isFollowing) {
    currentUser.following = currentUser.following.filter(
      (id) => String(id) !== String(targetUser._id)
    );
    targetUser.followers = targetUser.followers.filter(
      (id) => String(id) !== String(currentUser._id)
    );
  } else {
    currentUser.following.addToSet(targetUser._id);
    targetUser.followers.addToSet(currentUser._id);
  }

  await Promise.all([currentUser.save(), targetUser.save()]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        followed: !isFollowing,
        followersCount: targetUser.followers.length,
        followingCount: currentUser.following.length,
      },
      isFollowing ? "User unfollowed successfully" : "User followed successfully"
    )
  );
});

export {
  getMyProfile,
  getUserProfile,
  updateProfile,
  toggleFollow,
  searchUsers,
  updateProfilePrivacy,
};