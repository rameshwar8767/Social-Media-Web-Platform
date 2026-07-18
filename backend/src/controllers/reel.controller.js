import fs from "fs";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Reel } from "../models/reel.model.js";
import { uploadVideo, uploadImage } from "../services/cloudinary.service.js";
import { createNotification } from "../services/notification.service.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const safeUnlink = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const createReel = asyncHandler(async (req, res) => {
  const { caption } = req.body;
  const videoFile = req.files?.video?.[0];
  const thumbnailFile = req.files?.thumbnail?.[0];

  if (!videoFile) {
    throw new ApiError(400, "Video file is required");
  }

  if (!videoFile.mimetype?.startsWith("video/")) {
    safeUnlink(videoFile.path);
    if (thumbnailFile) safeUnlink(thumbnailFile.path);
    throw new ApiError(400, "Only video files are allowed for reels");
  }

  if (thumbnailFile && !thumbnailFile.mimetype?.startsWith("image/")) {
    safeUnlink(videoFile.path);
    safeUnlink(thumbnailFile.path);
    throw new ApiError(400, "Thumbnail must be an image");
  }

  if (videoFile.size > 100 * 1024 * 1024) {
    safeUnlink(videoFile.path);
    if (thumbnailFile) safeUnlink(thumbnailFile.path);
    throw new ApiError(400, "Video too large (max 100MB)");
  }

  try {
    const videoResult = await uploadVideo(videoFile.path, "social_media/reels");
    safeUnlink(videoFile.path);

    let thumbnailResult = null;
    if (thumbnailFile) {
      thumbnailResult = await uploadImage(
        thumbnailFile.path,
        "social_media/reels/thumbnails"
      );
      safeUnlink(thumbnailFile.path);
    }

    const reel = await Reel.create({
      user: req.user._id,
      caption: caption?.trim() || "",
      video: {
        url:
          videoResult?.video?.url ||
          videoResult?.video?.secure_url ||
          videoResult?.url ||
          videoResult?.secure_url,
        public_id: videoResult?.video?.public_id || videoResult?.public_id,
        duration: videoResult?.video?.duration || videoResult?.duration || 0,
      },
      thumbnail: thumbnailResult
        ? {
            url: thumbnailResult?.url || thumbnailResult?.secure_url,
            public_id: thumbnailResult?.public_id,
          }
        : null,
    });

    const populatedReel = await Reel.findById(reel._id)
      .populate("user", "username full_name profile_picture")
      .populate("likes", "username")
      .lean();

    return res
      .status(201)
      .json(new ApiResponse(201, populatedReel, "Reel created successfully"));
  } catch (error) {
    safeUnlink(videoFile?.path);
    safeUnlink(thumbnailFile?.path);
    throw error;
  }
});

const getReelsFeed = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
  const tab = req.query.tab || "following";
  const skip = (page - 1) * limit;

  const followingIds = [
    String(req.user._id),
    ...(req.user.following || []).map((id) => String(id)),
  ];

  let reels = [];
  let total = 0;

  if (tab === "for_you") {
    reels = await Reel.aggregate([
      {
        $addFields: {
          likesCount: { $size: { $ifNull: ["$likes", []] } },
          commentsCount: { $ifNull: ["$commentsCount", 0] },
          score: {
            $add: [
              { $multiply: [{ $ifNull: ["$views", 0] }, 1.5] },
              { $multiply: [{ $size: { $ifNull: ["$likes", []] } }, 3] },
              { $multiply: [{ $ifNull: ["$commentsCount", 0] }, 2] },
              {
                $subtract: [
                  1000,
                  {
                    $divide: [
                      { $subtract: [new Date(), "$createdAt"] },
                      86400000,
                    ],
                  },
                ],
              },
            ],
          },
        },
      },
      {
        $sort: { score: -1, createdAt: -1 },
      },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
          pipeline: [
            {
              $project: {
                username: 1,
                full_name: 1,
                profile_picture: 1,
              },
            },
          ],
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    ]);

    total = await Reel.countDocuments();
  } else {
    const query = { user: { $in: followingIds } };

    [reels, total] = await Promise.all([
      Reel.find(query)
        .populate("user", "username full_name profile_picture")
        .populate("likes", "username")
        .sort({ createdAt: -1, views: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Reel.countDocuments(query),
    ]);
  }

  return res.status(200).json(
    new ApiResponse(200, {
      reels,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + reels.length < total,
      },
      tab,
    })
  );
});

const likeUnlikeReel = asyncHandler(async (req, res) => {
  const { reelId } = req.params;

  if (!isValidObjectId(reelId)) {
    throw new ApiError(400, "Invalid reelId");
  }

  const reel = await Reel.findById(reelId).populate("user", "_id");
  if (!reel) {
    throw new ApiError(404, "Reel not found");
  }

  const wasLiked = reel.likes.some(
    (like) => String(like) === String(req.user._id)
  );

  if (wasLiked) {
    reel.likes.pull(req.user._id);
  } else {
    reel.likes.addToSet(req.user._id);

    if (String(reel.user._id) !== String(req.user._id)) {
      await createNotification("like_reel", reel.user._id, req.user._id, {
        reel: reelId,
      });
    }
  }

  await reel.save();

  return res.status(200).json(
    new ApiResponse(200, {
      likesCount: reel.likes.length,
      liked: !wasLiked,
    })
  );
});

const incrementView = asyncHandler(async (req, res) => {
  const { reelId } = req.params;

  if (!isValidObjectId(reelId)) {
    throw new ApiError(400, "Invalid reelId");
  }

  const reel = await Reel.findByIdAndUpdate(
    reelId,
    { $inc: { views: 1 } },
    { new: true }
  ).lean();

  if (!reel) {
    throw new ApiError(404, "Reel not found");
  }

  return res.status(200).json(
    new ApiResponse(200, {
      views: reel.views,
    }, "View counted")
  );
});

const deleteReel = asyncHandler(async (req, res) => {
  const { reelId } = req.params;

  if (!isValidObjectId(reelId)) {
    throw new ApiError(400, "Invalid reelId");
  }

  const reel = await Reel.findById(reelId);
  if (!reel) {
    throw new ApiError(404, "Reel not found");
  }

  if (String(reel.user) !== String(req.user._id)) {
    throw new ApiError(403, "Not authorized to delete this reel");
  }

  if (reel.video?.public_id) {
    await cloudinary.uploader.destroy(reel.video.public_id, {
      resource_type: "video",
    });
  }

  if (reel.thumbnail?.public_id) {
    await cloudinary.uploader.destroy(reel.thumbnail.public_id, {
      resource_type: "image",
    });
  }

  await Reel.findByIdAndDelete(reelId);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Reel deleted successfully"));
});

export {
  createReel,
  getReelsFeed,
  likeUnlikeReel,
  incrementView,
  deleteReel,
};