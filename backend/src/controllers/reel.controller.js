import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Reel } from '../models/reel.model.js';
import { uploadVideo } from '../services/cloudinary.service.js';  // ✅ Service only
import { uploadImage } from '../services/cloudinary.service.js';  // Thumbnail
import { createNotification } from '../services/notification.service.js';
import fs from 'fs';

const createReel = asyncHandler(async (req, res) => {
  const { caption } = req.body;
  const videoFile = req.files?.video?.[0];
  const thumbnailFile = req.files?.thumbnail?.[0];

  if (!videoFile) {
    throw new ApiError(400, 'Video file required (MP4 max 60s)');
  }

  if (videoFile.size > 100 * 1024 * 1024) {  // 100MB
    throw new ApiError(400, 'Video too large (max 100MB)');
  }

  try {
    // Upload optimized video
    const videoResult = await uploadVideo(videoFile.path, 'social_media/reels');
    fs.unlinkSync(videoFile.path);

    // Upload custom thumbnail (optional)
    let thumbnailResult = null;
    if (thumbnailFile) {
      thumbnailResult = await uploadImage(thumbnailFile.path, 'social_media/reels/thumbnails');
      fs.unlinkSync(thumbnailFile.path);
    }

    const reel = await Reel.create({
      user: req.user._id,
      caption: caption?.trim() || '',
      video: {
        url: videoResult.video.url,
        public_id: videoResult.video.public_id,
        duration: videoResult.video.duration || 0
      },
      thumbnail: thumbnailResult ? {
        url: thumbnailResult.url,
        public_id: thumbnailResult.public_id
      } : null
    });

    // Populate response
    const populatedReel = await Reel.findById(reel._id)
      .populate('user', 'username full_name profile_picture')
      .populate('likes', 'username');

    res.status(201).json(
      new ApiResponse(201, populatedReel, 'Reel created successfully')
    );
  } catch (error) {
    // Cleanup on error
    fs.unlinkSync(videoFile.path);
    if (thumbnailFile) fs.unlinkSync(thumbnailFile.path);
    throw error;
  }
});

const getReelsFeed = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, tab = 'following' } = req.query;
  const skip = (page - 1) * Number(limit);

  const followingIds = [req.user._id, ...req.user.following.map(id => id.toString())];

  let reels;
  if (tab === 'for_you') {
    // Algorithmic: High views + engagement
    reels = await Reel.aggregate([
      {
        $addFields: {
          score: {
            $add: [
              { $multiply: ['$views', 1.5] },
              { $size: '$likes' },
              { 
                $divide: [{ $subtract: [new Date(), '$createdAt'] }, 86400000] 
              }
            ]
          }
        }
      },
      { $match: { 
        $or: [
          { user: { $in: followingIds } },
          { score: { $gte: 1000 } }
        ]
      } },
      { $sort: { score: -1, createdAt: -1 } },
      { $skip: skip },
      { $limit: Number(limit) },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
          pipeline: [{ 
            $project: { 
              username: 1, 
              full_name: 1, 
              profile_picture: 1 
            } 
          }]
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          likesCount: { $size: '$likes' },
          commentsCount: { $ifNull: [{ $size: '$comments' }, 0] }
        }
      }
    ]);
  } else {
    // Following feed
    reels = await Reel.find({ user: { $in: followingIds } })
      .populate('user', 'username full_name profile_picture')
      .populate('likes', 'username')
      .sort({ createdAt: -1, views: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();
  }

  const total = await Reel.countDocuments({ 
    user: { $in: followingIds } 
  });

  res.status(200).json(
    new ApiResponse(200, {
      reels,
      page: Number(page),
      limit: Number(limit),
      hasMore: skip + reels.length < total,
      tab
    })
  );
});

const likeUnlikeReel = asyncHandler(async (req, res) => {
  const { reelId } = req.params;
  
  const reel = await Reel.findById(reelId).populate('user');
  if (!reel) throw new ApiError(404, 'Reel not found');

  const likeIndex = reel.likes.findIndex(like => 
    like.toString() === req.user._id.toString()
  );

  const wasLiked = likeIndex !== -1;
  
  if (wasLiked) {
    reel.likes.splice(likeIndex, 1);
  } else {
    reel.likes.push(req.user._id);
    
    // Notify reel owner
    if (!reel.user._id.equals(req.user._id)) {
      await createNotification(
        'like_reel',
        reel.user._id,
        req.user._id,
        { reel: reelId }
      );
    }
  }

  await reel.save();

  res.status(200).json(
    new ApiResponse(200, { 
      likesCount: reel.likes.length,
      liked: !wasLiked 
    })
  );
});

const incrementView = asyncHandler(async (req, res) => {
  const { reelId } = req.params;
  
  const reel = await Reel.findByIdAndUpdate(
    reelId, 
    { $inc: { views: 1 } },
    { new: true }
  );
  
  if (!reel) throw new ApiError(404, 'Reel not found');

  res.status(200).json(
    new ApiResponse(200, { 
      views: reel.views,
      message: 'View counted' 
    })
  );
});

const deleteReel = asyncHandler(async (req, res) => {
  const { reelId } = req.params;
  
  const reel = await Reel.findById(reelId);
  if (!reel) throw new ApiError(404, 'Reel not found');
  
  if (!reel.user.equals(req.user._id)) {
    throw new ApiError(403, 'Not authorized');
  }

  // Cleanup Cloudinary
  if (reel.video.public_id) {
    await cloudinary.uploader.destroy(reel.video.public_id, { resource_type: 'video' });
  }
  if (reel.thumbnail?.public_id) {
    await cloudinary.uploader.destroy(reel.thumbnail.public_id);
  }

  await Reel.findByIdAndDelete(reelId);

  res.json(new ApiResponse(200, null, 'Reel deleted'));
});

export { 
  createReel, 
  getReelsFeed, 
  likeUnlikeReel, 
  incrementView,
  deleteReel 
};
