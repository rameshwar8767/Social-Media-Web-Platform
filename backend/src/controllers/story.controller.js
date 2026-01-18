import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Story } from '../models/story.model.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import fs from 'fs';

const createStory = asyncHandler(async (req, res) => {
  const mediaFiles = req.files || [];
  if (!mediaFiles.length) throw new ApiError(400, 'Media required');

  const media = await Promise.all(
    mediaFiles.map(async (file) => {
      const result = await uploadToCloudinary(file.path, {
        folder: 'social_media/stories'
      });
      fs.unlinkSync(file.path);
      return { 
        url: result.secure_url, 
        public_id: result.public_id,
        type: file.mimetype.split('/')[0]
      };
    })
  );

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);  // 24h

  const story = await Story.create({
    user: req.user._id,
    media,
    expiresAt
  });

  const populatedStory = await Story.findById(story._id)
    .populate('user', 'username profile_picture')
    .populate('viewers.user', 'username profile_picture');

  res.status(201).json(
    new ApiResponse(201, populatedStory, 'Story posted')
  );
});

const getStoriesFeed = asyncHandler(async (req, res) => {
  // Following users + self active stories
  const followingIds = [req.user._id, ...req.user.following];
  
  const stories = await Story.find({
    user: { $in: followingIds },
    expiresAt: { $gt: new Date() }
  })
    .sort({ createdAt: -1 })
    .populate('user', 'username profile_picture full_name')
    .populate('viewers.user', 'username')
    .lean();

  // Group by user
  const storiesByUser = stories.reduce((acc, story) => {
    if (!acc[story.user._id.toString()]) {
      acc[story.user._id.toString()] = {
        user: story.user,
        stories: [],
        unseenCount: 0
      };
    }
    const seen = story.viewers.some(v => v.user._id.toString() === req.user._id.toString());
    acc[story.user._id.toString()].stories.push(story);
    if (!seen) acc[story.user._id.toString()].unseenCount++;
    return acc;
  }, {});

  res.status(200).json(
    new ApiResponse(200, {
      stories: Object.values(storiesByUser),
      totalUnseen: Object.values(storiesByUser).reduce((sum, u) => sum + u.unseenCount, 0)
    })
  );
});

const markStoryAsSeen = asyncHandler(async (req, res) => {
  const { storyId } = req.params;
  
  const story = await Story.findById(storyId);
  if (!story) throw new ApiError(404, 'Story not found');

  // Add viewer if not exists
  const viewerExists = story.viewers.some(v => v.user.toString() === req.user._id.toString());
  if (!viewerExists) {
    story.viewers.push({ user: req.user._id });
    await story.save();
  }

  res.status(200).json(new ApiResponse(200, { viewersCount: story.viewers.length }));
});

const addStoryReaction = asyncHandler(async (req, res) => {
  const { storyId } = req.params;
  const { emoji } = req.body;

  if (!emoji || emoji.length > 2) {
    throw new ApiError(400, 'Valid emoji required (1-2 chars)');
  }

  const story = await Story.findById(storyId);
  if (!story) throw new ApiError(404, 'Story not found');

  // Remove previous reaction from same user
  story.reactions = story.reactions.filter(r => r.user.toString() !== req.user._id.toString());
  story.reactions.push({ user: req.user._id, emoji });

  await story.save();

  res.status(200).json(
    new ApiResponse(200, { reactionsCount: story.reactions.length })
  );
});

export { createStory, getStoriesFeed, markStoryAsSeen, addStoryReaction };
