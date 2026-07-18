import fs from "fs";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Post } from "../models/post.model.js";
import { uploadImage, uploadVideo } from "../services/cloudinary.service.js";
import { createNotification } from "../services/notification.service.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const safeUnlink = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const createPost = asyncHandler(async (req, res) => {
  const { caption } = req.body;
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
          result = await uploadImage(file.path, "social_media/posts");
        } else if (file.mimetype.startsWith("video/")) {
          result = await uploadVideo(file.path, "social_media/posts");
        } else {
          throw new ApiError(400, `Unsupported media type: ${file.mimetype}`);
        }

        safeUnlink(file.path);

        return {
          url: result?.url || result?.secure_url || result?.video?.url || result?.video?.secure_url,
          public_id: result?.public_id,
          type: file.mimetype.split("/")[0],
        };
      })
    );
  } catch (error) {
    mediaFiles.forEach((file) => safeUnlink(file.path));
    throw error;
  }

  const post = await Post.create({
    user: req.user._id,
    caption: caption?.trim() || "",
    media,
  });

  const postWithUser = await Post.findById(post._id)
    .populate("user", "username full_name profile_picture")
    .populate("likes", "username")
    .lean();

  return res
    .status(201)
    .json(new ApiResponse(201, postWithUser, "Post created successfully"));
});

const getFeed = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
  const tab = req.query.tab || "following";
  const skip = (page - 1) * limit;

  if (tab === "following") {
    const followingIds = [
      String(req.user._id),
      ...(req.user.following || []).map((id) => String(id)),
    ];

    const query = {
      user: { $in: followingIds },
    };

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate("user", "username full_name profile_picture")
        .populate("likes", "username")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(query),
    ]);

    return res.status(200).json(
      new ApiResponse(200, {
        posts,
        pagination: {
          page,
          limit,
          total,
          hasMore: skip + posts.length < total,
        },
        tab,
      })
    );
  }

  const scorePosts = await Post.aggregate([
    {
      $addFields: {
        likesCount: { $size: { $ifNull: ["$likes", []] } },
        score: {
          $add: [
            { $multiply: [{ $size: { $ifNull: ["$likes", []] } }, 4] },
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
    { $sort: { score: -1, createdAt: -1 } },
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

  return res.status(200).json(
    new ApiResponse(200, {
      posts: scorePosts,
      pagination: {
        page,
        limit,
        hasMore: scorePosts.length === limit,
      },
      tab: "for_you",
    })
  );
});

const likeUnlikePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!isValidObjectId(postId)) {
    throw new ApiError(400, "Invalid postId");
  }

  const post = await Post.findById(postId).populate("user", "_id");
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const wasLiked = post.likes.some(
    (like) => String(like) === String(req.user._id)
  );

  if (wasLiked) {
    post.likes.pull(req.user._id);
  } else {
    post.likes.addToSet(req.user._id);

    if (String(post.user._id) !== String(req.user._id)) {
      await createNotification("like_post", post.user._id, req.user._id, {
        post: postId,
      });
    }
  }

  await post.save();

  return res.status(200).json(
    new ApiResponse(200, {
      likesCount: post.likes.length,
      liked: !wasLiked,
    })
  );
});

const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!isValidObjectId(postId)) {
    throw new ApiError(400, "Invalid postId");
  }

  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  if (String(post.user) !== String(req.user._id)) {
    throw new ApiError(403, "Not authorized to delete this post");
  }

  for (const mediaItem of post.media) {
    if (!mediaItem.public_id) continue;

    await cloudinary.uploader.destroy(mediaItem.public_id, {
      resource_type: mediaItem.type === "video" ? "video" : "image",
    });
  }

  await Post.findByIdAndDelete(postId);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Post deleted successfully"));
});

export {
  createPost,
  getFeed,
  likeUnlikePost,
  deletePost,
};