import { Post } from '../models/post.model.js';  // ✅ Fixed model path
import { Reel } from '../models/reel.model.js';  // ✅ Fixed model path
import { User } from '../models/user.model.js';  // ✅ Fixed model name/path

export const getFollowingFeed = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  // Get following users once (performance fix)
  const user = await User.findById(userId).select('following');
  const followingIds = [userId, ...user.following.map(id => id.toString())];
  
  const [posts, reels] = await Promise.all([
    Post.find({ 
      user: { $in: followingIds }
    })
      .populate('user', 'username profile_picture full_name')
      .populate('likes', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
      
    Reel.find({ 
      user: { $in: followingIds }
    })
      .populate('user', 'username profile_picture full_name')
      .sort({ createdAt: -1, views: -1 })
      .skip(skip)
      .limit(Math.floor(limit / 2))
      .lean()
  ]);

  return { posts, reels, type: 'following' };
};

export const getForYouFeed = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  // Fixed aggregate - proper date handling + scoring
  const [posts, reels] = await Promise.all([
    Post.aggregate([
      {
        $addFields: {
          likesCount: { $size: '$likes' },
          score: {
            $add: [
              { $multiply: [{ $size: '$likes' }, 4] },
              { $size: '$comments' },
              { 
                $divide: [{ 
                  $subtract: [new Date(), { $toDate: '$createdAt' }] 
                }, 86400000]  // Days old (negative for recency)
              }
            ]
          }
        }
      },
      { $match: { score: { $gte: 5 }, likesCount: { $gte: 1 } } },
      { $sort: { score: -1, createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
          pipeline: [{ 
            $project: { 
              username: 1, 
              profile_picture: 1, 
              full_name: 1 
            } 
          }]
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          likesCount: { $size: '$likes' }
        }
      }
    ]),

    Reel.aggregate([
      {
        $addFields: {
          score: {
            $add: [
              { $multiply: ['$views', 1.5] },
              { $size: '$likes' },
              { 
                $divide: [{ 
                  $subtract: [new Date(), { $toDate: '$createdAt' }] 
                }, 86400000] 
              }
            ]
          }
        }
      },
      { $match: { score: { $gte: 500 }, views: { $gte: 100 } } },
      { $sort: { score: -1, createdAt: -1 } },
      { $skip: skip },
      { $limit: Math.floor(limit / 2) },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } }
    ])
  ]);

  return { posts, reels, type: 'for_you' };
};

export const getExploreFeed = async (topic = '', page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  // Trending content
  const trendingPosts = await Post.find()
    .sort({ likes: -1, createdAt: -1 })
    .limit(limit)
    .populate('user', 'username profile_picture')
    .lean();

  return { 
    trending: trendingPosts, 
    type: 'explore',
    topic 
  };
};
