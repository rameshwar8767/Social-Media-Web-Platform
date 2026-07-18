import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";
import { Post } from "../models/post.model.js";
import { Reel } from "../models/reel.model.js";
import { createNotification } from "../services/notification.service.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const addComment = asyncHandler(async (req, res) => {
  const { postId, reelId, text, parentCommentId } = req.body;

  if ((!postId && !reelId) || (postId && reelId)) {
    throw new ApiError(400, "Provide either postId or reelId, but not both");
  }

  if (!text || !text.trim()) {
    throw new ApiError(400, "Comment text is required");
  }

  if (postId && !isValidObjectId(postId)) {
    throw new ApiError(400, "Invalid postId");
  }

  if (reelId && !isValidObjectId(reelId)) {
    throw new ApiError(400, "Invalid reelId");
  }

  if (parentCommentId && !isValidObjectId(parentCommentId)) {
    throw new ApiError(400, "Invalid parentCommentId");
  }

  let targetPost = null;
  let targetReel = null;
  let parentComment = null;

  if (postId) {
    targetPost = await Post.findById(postId).select("_id user");
    if (!targetPost) {
      throw new ApiError(404, "Post not found");
    }
  }

  if (reelId) {
    targetReel = await Reel.findById(reelId).select("_id user");
    if (!targetReel) {
      throw new ApiError(404, "Reel not found");
    }
  }

  if (parentCommentId) {
    parentComment = await Comment.findById(parentCommentId).select(
      "_id post reel parentComment"
    );

    if (!parentComment) {
      throw new ApiError(404, "Parent comment not found");
    }

    if (
      (postId && String(parentComment.post) !== String(postId)) ||
      (reelId && String(parentComment.reel) !== String(reelId))
    ) {
      throw new ApiError(400, "Parent comment does not belong to this target");
    }
  }

  const comment = await Comment.create({
    user: req.user._id,
    text: text.trim(),
    post: postId || null,
    reel: reelId || null,
    parentComment: parentCommentId || null,
  });

  if (parentCommentId) {
    await Comment.findByIdAndUpdate(parentCommentId, {
      $addToSet: { replies: comment._id },
    });
  }

  if (postId) {
    await Post.findByIdAndUpdate(postId, {
      $inc: { commentsCount: 1 },
      $push: {
        topComments: {
          $each: [comment._id],
          $position: 0,
          $slice: 3,
        },
      },
    });

    if (String(targetPost.user) !== String(req.user._id)) {
      await createNotification("comment_post", targetPost.user, req.user._id, {
        post: postId,
        comment: comment._id,
      });
    }
  }

  if (reelId) {
    await Reel.findByIdAndUpdate(reelId, {
      $inc: { commentsCount: 1 },
    });

    if (String(targetReel.user) !== String(req.user._id)) {
      await createNotification("comment_reel", targetReel.user, req.user._id, {
        reel: reelId,
        comment: comment._id,
      });
    }
  }

  const populatedComment = await Comment.findById(comment._id)
    .populate("user", "username profile_picture full_name")
    .populate({
      path: "replies",
      populate: { path: "user", select: "username profile_picture full_name" },
      options: { limit: 5, sort: { createdAt: -1 } },
    });

  return res
    .status(201)
    .json(new ApiResponse(201, populatedComment, "Comment added successfully"));
});

const getComments = asyncHandler(async (req, res) => {
  const { postId, reelId, parentCommentId } = req.query;

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);
  const skip = (page - 1) * limit;

  if ((!postId && !reelId) || (postId && reelId)) {
    throw new ApiError(400, "Provide either postId or reelId, but not both");
  }

  if (postId && !isValidObjectId(postId)) {
    throw new ApiError(400, "Invalid postId");
  }

  if (reelId && !isValidObjectId(reelId)) {
    throw new ApiError(400, "Invalid reelId");
  }

  if (parentCommentId && !isValidObjectId(parentCommentId)) {
    throw new ApiError(400, "Invalid parentCommentId");
  }

  const query = {
    ...(postId && { post: postId }),
    ...(reelId && { reel: reelId }),
    ...(parentCommentId
      ? { parentComment: parentCommentId }
      : { parentComment: null }),
  };

  const comments = await Comment.find(query)
    .populate("user", "username profile_picture full_name")
    .populate({
      path: "replies",
      populate: { path: "user", select: "username profile_picture full_name" },
      options: { limit: 3, sort: { createdAt: -1 } },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        comments,
        pagination: {
          page,
          limit,
          hasMore: comments.length === limit,
        },
      },
      "Comments fetched successfully"
    )
  );
});

const likeComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid commentId");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const alreadyLiked = comment.likes.some(
    (id) => String(id) === String(req.user._id)
  );

  if (alreadyLiked) {
    comment.likes.pull(req.user._id);
  } else {
    comment.likes.addToSet(req.user._id);
  }

  await comment.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        liked: !alreadyLiked,
        likesCount: comment.likes.length,
      },
      alreadyLiked ? "Comment unliked" : "Comment liked"
    )
  );
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid commentId");
  }

  const comment = await Comment.findById(commentId).select(
    "_id user post reel parentComment replies"
  );

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (String(comment.user) !== String(req.user._id)) {
    throw new ApiError(403, "Not authorized to delete this comment");
  }

  const childReplies = await Comment.find({ parentComment: comment._id }).select("_id");
  const idsToDelete = [comment._id, ...childReplies.map((reply) => reply._id)];

  await Comment.deleteMany({ _id: { $in: idsToDelete } });

  if (comment.parentComment) {
    await Comment.findByIdAndUpdate(comment.parentComment, {
      $pull: { replies: comment._id },
    });
  }

  if (comment.post) {
    await Post.findByIdAndUpdate(comment.post, {
      $inc: { commentsCount: -idsToDelete.length },
      $pull: { topComments: { $in: idsToDelete } },
    });
  }

  if (comment.reel) {
    await Reel.findByIdAndUpdate(comment.reel, {
      $inc: { commentsCount: -idsToDelete.length },
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Comment deleted successfully"));
});

export { addComment, getComments, likeComment, deleteComment };