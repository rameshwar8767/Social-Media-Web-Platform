import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Post } from "../models/post.model.js";
import { getFollowingFeed, getForYouFeed } from "../services/feed.service.js";

const getHomeFeed = asyncHandler(async (req, res) => {
  const tab = req.query.tab || "following";
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

  const feed =
    tab === "for_you"
      ? await getForYouFeed(page, limit)
      : await getFollowingFeed(req.user._id, page, limit);

  return res
    .status(200)
    .json(new ApiResponse(200, feed, "Home feed fetched successfully"));
});

const getExplore = asyncHandler(async (req, res) => {
  const q = req.query.q?.trim() || "";
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
  const skip = (page - 1) * limit;

  const trendingPosts = await Post.aggregate([
    {
      $addFields: {
        likesCount: { $size: { $ifNull: ["$likes", []] } },
      },
    },
    { $sort: { likesCount: -1, createdAt: -1 } },
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
              profile_picture: 1,
              full_name: 1,
            },
          },
        ],
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        trending: trendingPosts,
        search: q ? [] : [],
        pagination: {
          page,
          limit,
          hasMore: trendingPosts.length === limit,
        },
      },
      "Explore feed fetched successfully"
    )
  );
});

export { getHomeFeed, getExplore };