import fs from "fs";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Story } from "../models/story.model.js";
import { uploadImage, uploadVideo } from "../services/cloudinary.service.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const safeUnlink = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const createStory = asyncHandler(async (req, res) => {
  const mediaFiles = Array.isArray(req.files) ? req.files : [];

  if (!mediaFiles.length) {
    throw new ApiError(400, "At least one media file is required");
  }

  let media = [];

  try {
    media = await Promise.all(
      mediaFiles.map(async (file) => {
        let result;

        if (file.mimetype.startsWith("image/")) {
          result = await uploadImage(file.path, "social_media/stories");
        } else if (file.mimetype.startsWith("video/")) {
          result = await uploadVideo(file.path, "social_media/stories");
        } else {
          throw new ApiError(400, `Unsupported media type: ${file.mimetype}`);
        }

        safeUnlink(file.path);

        return {
          url:
            result?.url ||
            result?.secure_url ||
            result?.video?.url ||
            result?.video?.secure_url,
          public_id: result?.public_id || result?.video?.public_id,
          type: file.mimetype.split("/")[0],
        };
      })
    );
  } catch (error) {
    mediaFiles.forEach((file) => safeUnlink(file.path));
    throw error;
  }

  const story = await Story.create({
    user: req.user._id,
    media,
    caption: req.body.caption?.trim() || "",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  const populatedStory = await Story.findById(story._id)
    .populate("user", "username profile_picture full_name")
    .populate("viewers.user", "username profile_picture")
    .lean();

  return res
    .status(201)
    .json(new ApiResponse(201, populatedStory, "Story posted successfully"));
});

const getStoriesFeed = asyncHandler(async (req, res) => {
  const followingIds = [req.user._id, ...(req.user.following || [])];

  const stories = await Story.find({
    user: { $in: followingIds },
    expiresAt: { $gt: new Date() },
  })
    .sort({ createdAt: -1 })
    .populate("user", "username profile_picture full_name")
    .populate("viewers.user", "username")
    .lean();

  const storiesByUser = stories.reduce((acc, story) => {
    const userId = story.user._id.toString();

    if (!acc[userId]) {
      acc[userId] = {
        user: story.user,
        stories: [],
        unseenCount: 0,
      };
    }

    const seen = (story.viewers || []).some(
      (viewer) => viewer.user?._id?.toString() === req.user._id.toString()
    );

    acc[userId].stories.push(story);
    if (!seen) acc[userId].unseenCount += 1;

    return acc;
  }, {});

  const groupedStories = Object.values(storiesByUser);
  const totalUnseen = groupedStories.reduce(
    (sum, item) => sum + item.unseenCount,
    0
  );

  return res.status(200).json(
    new ApiResponse(200, {
      stories: groupedStories,
      totalUnseen,
    })
  );
});

const markStoryAsSeen = asyncHandler(async (req, res) => {
  const { storyId } = req.params;

  if (!isValidObjectId(storyId)) {
    throw new ApiError(400, "Invalid storyId");
  }

  const story = await Story.findOne({
    _id: storyId,
    expiresAt: { $gt: new Date() },
  });

  if (!story) {
    throw new ApiError(404, "Story not found or expired");
  }

  const viewerExists = story.viewers.some(
    (viewer) => viewer.user.toString() === req.user._id.toString()
  );

  if (!viewerExists) {
    story.viewers.push({ user: req.user._id });
    await story.save();
  }

  return res.status(200).json(
    new ApiResponse(200, {
      viewersCount: story.viewers.length,
    }, "Story marked as seen")
  );
});

const addStoryReaction = asyncHandler(async (req, res) => {
  const { storyId } = req.params;
  const { emoji } = req.body;

  if (!isValidObjectId(storyId)) {
    throw new ApiError(400, "Invalid storyId");
  }

  if (!emoji || typeof emoji !== "string" || emoji.trim().length > 10) {
    throw new ApiError(400, "Valid emoji is required");
  }

  const story = await Story.findOne({
    _id: storyId,
    expiresAt: { $gt: new Date() },
  });

  if (!story) {
    throw new ApiError(404, "Story not found or expired");
  }

  story.reactions = story.reactions.filter(
    (reaction) => reaction.user.toString() !== req.user._id.toString()
  );

  story.reactions.push({
    user: req.user._id,
    emoji: emoji.trim(),
  });

  await story.save();

  return res.status(200).json(
    new ApiResponse(200, {
      reactionsCount: story.reactions.length,
    }, "Reaction added successfully")
  );
});

export {
  createStory,
  getStoriesFeed,
  markStoryAsSeen,
  addStoryReaction,
};