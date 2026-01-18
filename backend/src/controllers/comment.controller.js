import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Comment } from '../models/comment.model.js';
import { Post } from '../models/post.model.js';
import { Reel } from '../models/reel.model.js';
import { createNotification } from '../services/notification.service.js';

const addComment = asyncHandler(async (req, res) => {
  const { postId, reelId, text, parentCommentId } = req.body;

  if (!postId && !reelId) {
    throw new ApiError(400, 'Post or Reel ID required');
  }
  if (!text?.trim()) {
    throw new ApiError(400, 'Comment text required');
  }

  const commentData = {
    user: req.user._id,
    text: text.trim(),
    ...(postId && { post: postId }),
    ...(reelId && { reel: reelId }),
    ...(parentCommentId && { parentComment: parentCommentId })
  };

  const comment = await Comment.create(commentData);

  // Update parent comment replies
  if (parentCommentId) {
    await Comment.findByIdAndUpdate(parentCommentId, {
      $push: { replies: comment._id }
    });
  }

  // Update post/reel comments count + topComments
  if (postId) {
    await Post.findByIdAndUpdate(postId, {
      $inc: { commentsCount: 1 },
      $push: { topComments: { $each: [comment._id], $slice: 3 } }
    });
  }

  // Notify post owner (not self-replies)
  if (postId) {
    const post = await Post.findById(postId).populate('user');
    if (post.user._id.toString() !== req.user._id.toString()) {
      await createNotification(
        'comment_post',
        post.user._id,
        req.user._id,
        { post: postId }
      );
    }
  }

  const populatedComment = await Comment.findById(comment._id)
    .populate('user', 'username profile_picture full_name')
    .populate({
      path: 'replies',
      populate: { path: 'user', select: 'username profile_picture' },
      options: { limit: 5 }
    });

  res.status(201).json(
    new ApiResponse(201, populatedComment, 'Comment added')
  );
});

const getComments = asyncHandler(async (req, res) => {
  const { postId, reelId, parentCommentId, page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  if (!postId && !reelId) {
    throw new ApiError(400, 'Post or Reel ID required');
  }

  const query = {};
  if (postId) query.post = postId;
  if (reelId) query.reel = reelId;
  if (parentCommentId) query.parentComment = parentCommentId;

  const comments = await Comment.find(query)
    .populate('user', 'username profile_picture full_name')
    .populate({
      path: 'replies',
      populate: { path: 'user', select: 'username profile_picture' },
      options: { limit: 3 }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.json(new ApiResponse(200, comments));
});

const likeComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  
  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, 'Comment not found');

  const likeIndex = comment.likes.findIndex(id => id.toString() === req.user._id.toString());
  
  if (likeIndex !== -1) {
    comment.likes.splice(likeIndex, 1);
  } else {
    comment.likes.push(req.user._id);
  }

  await comment.save();

  res.json(new ApiResponse(200, { likesCount: comment.likes.length }));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  
  const comment = await Comment.findById(commentId).populate('post');
  if (!comment) throw new ApiError(404, 'Comment not found');
  
  if (comment.user._id.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized');
  }

  // Delete replies recursively (simplified)
  await Comment.deleteMany({ 
    $or: [{ _id: commentId }, { parentComment: commentId }] 
  });

  // Decrement post count
  if (comment.post) {
    await Post.findByIdAndUpdate(comment.post._id, { $inc: { commentsCount: -1 } });
  }

  res.json(new ApiResponse(200, null, 'Comment deleted'));
});

export { addComment, getComments, likeComment, deleteComment };
