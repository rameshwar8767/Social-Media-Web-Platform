import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Post } from '../models/post.model.js';  // ✅ Fixed model path
import { uploadImage, uploadVideo } from '../services/cloudinary.service.js';  // ✅ Service only
import fs from 'fs';
import { createNotification } from '../services/notification.service.js';

const createPost = asyncHandler(async (req, res) => {
  const { caption } = req.body;
  const mediaFiles = req.files || [];

  if (!mediaFiles.length) {
    throw new ApiError(400, 'At least one media file required');
  }

  // Smart media type detection + upload
  const media = await Promise.all(
    mediaFiles.map(async (file) => {
      let result;
      
      // Image
      if (file.mimetype.startsWith('image/')) {
        result = await uploadImage(file.path, 'social_media/posts');
      } 
      // Video
      else if (file.mimetype.startsWith('video/')) {
        result = await uploadVideo(file.path, 'social_media/posts');
      } else {
        fs.unlinkSync(file.path);
        throw new ApiError(400, `Unsupported media type: ${file.mimetype}`);
      }

      return {
        url: result.url || result.video.url,
        public_id: result.public_id,
        type: file.mimetype.split('/')[0]
      };
    })
  );

  const post = await Post.create({
    user: req.user._id,
    caption: caption?.trim() || '',
    media
  });

  // Populate for response
  const postWithUser = await Post.findById(post._id)
    .populate('user', 'username full_name profile_picture')
    .populate('likes', 'username');

  res.status(201).json(
    new ApiResponse(201, postWithUser, 'Post created successfully')
  );
});

const getFeed = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, tab = 'following' } = req.query;
  const skip = (page - 1) * Number(limit);

  // Following feed (default)
  if (tab === 'following') {
    const followingIds = [req.user._id, ...req.user.following.map(id => id.toString())];
    
    const posts = await Post.find({ 
      user: { $in: followingIds } 
    })
      .populate('user', 'username full_name profile_picture')
      .populate('likes', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Post.countDocuments({ user: { $in: followingIds } });

    return res.status(200).json(
      new ApiResponse(200, {
        posts,
        page: Number(page),
        limit: Number(limit),
        hasMore: skip + posts.length < total,
        tab
      })
    );
  }

  // For You feed (algorithmic)
  const scorePosts = await Post.aggregate([
    {
      $addFields: {
        likesCount: { $size: '$likes' },
        score: {
          $add: [
            { $multiply: [{ $size: '$likes' }, 4] },
            { $ifNull: [{ $size: '$comments' }, 0] },
            { $divide: [{ $subtract: [new Date(), '$createdAt'] }, 86400000] }  // Recency
          ]
        }
      }
    },
    { $match: { score: { $gte: 5 } } },
    { $sort: { score: -1, createdAt: -1 } },
    { $skip: skip },
    { $limit: Number(limit) },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
        pipeline: [{ $project: { username: 1, full_name: 1, profile_picture: 1 } }]
      }
    },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } }
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      posts: scorePosts,
      page: Number(page),
      tab: 'for_you',
      hasMore: scorePosts.length === Number(limit)
    })
  );
});

const likeUnlikePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  
  const post = await Post.findById(postId).populate('user');
  if (!post) throw new ApiError(404, 'Post not found');

  const likeIndex = post.likes.findIndex(like => 
    like.toString() === req.user._id.toString()
  );
  
  const wasLiked = likeIndex !== -1;
  
  if (wasLiked) {
    // Unlike
    post.likes.splice(likeIndex, 1);
  } else {
    // Like
    post.likes.push(req.user._id);
    
    // Notify post owner (if not self-like)
    if (!post.user._id.equals(req.user._id)) {
      await createNotification(
        'like_post',
        post.user._id,
        req.user._id,
        { post: postId }
      );
    }
  }

  await post.save();

  res.status(200).json(
    new ApiResponse(200, { 
      likesCount: post.likes.length,
      liked: !wasLiked 
    })
  );
});

const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  
  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, 'Post not found');
  
  if (!post.user.equals(req.user._id)) {
    throw new ApiError(403, 'Not authorized to delete this post');
  }

  // Delete from Cloudinary
  for (const mediaItem of post.media) {
    await cloudinary.api.delete_resources([mediaItem.public_id]);
  }

  await Post.findByIdAndDelete(postId);

  res.json(new ApiResponse(200, null, 'Post deleted'));
});

export { 
  createPost, 
  getFeed, 
  likeUnlikePost, 
  deletePost 
};
