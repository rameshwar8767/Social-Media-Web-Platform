import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';

const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  
  const user = await User.findOne({ username })
    .select('-password -refreshToken -emailVerificationToken')
    .populate('followers', 'username full_name profile_picture')
    .populate('following', 'username full_name profile_picture');

  if (!user) throw new ApiError(404, 'User not found');

  // Privacy check for non-followers
  const isOwner = req.user.username === username;
  const isFollower = req.user.following.includes(user._id);
  if (user.isPrivate && !isOwner && !isFollower) {
    throw new ApiError(403, 'Private profile - follow to view');
  }

  return res.status(200).json(
    new ApiResponse(200, {
      ...user._doc,
      followersCount: user.followers.length,
      followingCount: user.following.length
    }, 'Profile fetched')
  );
});

const searchUsers = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 10 } = req.query;
  if (!q || q.length < 2) {
    return res.status(400).json(new ApiResponse(400, [], 'Query too short'));
  }

  const skip = (page - 1) * limit;
  const users = await User.find({
    $or: [
      { username: { $regex: q, $options: 'i' } },
      { full_name: { $regex: q, $options: 'i' } }
    ],
    _id: { $ne: req.user._id }  // Exclude self
  })
    .select('username full_name profile_picture bio followers isPrivate')
    .populate('followers', 'username')  // Just count
    .limit(limit)
    .skip(skip)
    .lean();

  return res.status(200).json(
    new ApiResponse(200, {
      users,
      page: Number(page),
      limit: Number(limit),
      hasMore: users.length === limit
    })
  );
});

const followUnfollow = asyncHandler(async (req, res) => {
  const { targetId } = req.params;
  const currentUser = req.user;

  if (targetId === currentUser._id.toString()) {
    throw new ApiError(400, "Can't follow yourself");
  }

  const targetUser = await User.findById(targetId);
  if (!targetUser) throw new ApiError(404, 'User not found');

  const isFollowing = currentUser.following.includes(targetUser._id);
  
  if (isFollowing) {
    // Unfollow
    currentUser.following = currentUser.following.filter(id => id.toString() !== targetId);
    targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUser._id);
  } else {
    // Follow
    currentUser.following.push(targetUser._id);
    targetUser.followers.push(currentUser._id);
  }

  await Promise.all([currentUser.save(), targetUser.save()]);

  return res.status(200).json(
    new ApiResponse(200, {
      followed: !isFollowing,
      followersCount: targetUser.followers.length
    })
  );
});

const updateProfilePrivacy = asyncHandler(async (req, res) => {
  const { isPrivate } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { isPrivate },
    { new: true, runValidators: true }
  ).select('-password');

  return res.status(200).json(
    new ApiResponse(200, user, 'Privacy updated')
  );
});


const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('followers', 'username full_name profile_picture -_id')
    .populate('following', 'username full_name profile_picture -_id');

  if (!user) throw new ApiError(404, 'User not found');

  return res.status(200).json(
    new ApiResponse(200, {
      ...user._doc,
      followersCount: user.followers.length,
      followingCount: user.following.length
    }, 'Your profile fetched')
  );
});

// Updated exports
// Add these to src/controllers/user.controller.js

const updateProfile = asyncHandler(async (req, res) => {
  const { full_name, bio, location, profile_picture } = req.body;
  
  const allowedUpdates = ['full_name', 'bio', 'location', 'profile_picture'];
  const updates = {};
  
  if (full_name) updates.full_name = full_name.trim();
  if (bio !== undefined) updates.bio = bio;
  if (location) updates.location = location;
  if (profile_picture) updates.profile_picture = profile_picture;

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, 'No valid fields to update');
  }

  // Check username uniqueness if changed
  if (req.body.username && req.body.username.toLowerCase() !== req.user.username) {
    const exists = await User.findOne({ username: req.body.username.toLowerCase().trim() });
    if (exists) throw new ApiError(400, 'Username already taken');
    updates.username = req.body.username.toLowerCase().trim();
  }

  const user = await User.findByIdAndUpdate(
    req.user._id, 
    updates, 
    { new: true, runValidators: true }
  ).select('-password -refreshToken');

  return res.status(200).json(
    new ApiResponse(200, user, 'Profile updated')
  );
});

const toggleFollow = asyncHandler(async (req, res) => {
  const { id: targetId } = req.params;  // :id → targetId
  const currentUser = req.user;

  if (targetId === currentUser._id.toString()) {
    throw new ApiError(400, "Can't follow yourself");
  }

  const targetUser = await User.findById(targetId);
  if (!targetUser) throw new ApiError(404, 'User not found');

  const isFollowingIndex = currentUser.following.findIndex(fid => fid.toString() === targetId);
  const isFollowing = isFollowingIndex !== -1;

  if (isFollowing) {
    // Unfollow
    currentUser.following.splice(isFollowingIndex, 1);
    targetUser.followers = targetUser.followers.filter(fid => fid.toString() !== currentUser._id.toString());
  } else {
    // Follow
    currentUser.following.push(targetUser._id);
    targetUser.followers.push(currentUser._id);
  }

  await Promise.all([currentUser.save(), targetUser.save()]);

  return res.status(200).json(
    new ApiResponse(200, {
      followed: !isFollowing,
      followersCount: targetUser.followers.length,
      followingCount: currentUser.following.length
    }, isFollowing ? 'Unfollowed' : 'Followed')
  );
});

// Updated exports
export {
  getMyProfile,
  getUserProfile,
  updateProfile,     // ← NEW
  toggleFollow,      // ← NEW (renamed from followUnfollow)
  searchUsers,
  updateProfilePrivacy
};


