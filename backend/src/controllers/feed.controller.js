import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { getFollowingFeed, getForYouFeed } from '../services/feed.service.js';

const getHomeFeed = asyncHandler(async (req, res) => {
  const { tab = 'following', page = 1, limit = 10 } = req.query;
  
  let feed;
  if (tab === 'for_you') {
    feed = await getForYouFeed(page, limit);
  } else {
    feed = await getFollowingFeed(req.user._id, page, limit);
  }

  res.json(new ApiResponse(200, feed));
});

const getExplore = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 10 } = req.query;
  
  // Trending + search
  const trendingPosts = await Post.find()
    .sort({ likes: -1, createdAt: -1 })
    .limit(5)
    .populate('user', 'username profile_picture')
    .lean();

  res.json(new ApiResponse(200, { 
    trending: trendingPosts,
    search: q ? [] : []  // Hashtag impl later
  }));
});

export { getHomeFeed, getExplore };
