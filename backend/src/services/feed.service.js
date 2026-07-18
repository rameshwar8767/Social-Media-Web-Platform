import { Post } from "../models/post.model.js";
import { Reel } from "../models/reel.model.js";
import { User } from "../models/user.model.js";

export const getFollowingFeed = async (userId, page = 1, limit = 10) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
  const skip = (safePage - 1) * safeLimit;

  const user = await User.findById(userId).select("following").lean();

  if (!user) {
    throw new Error("User not found");
  }

  const followingIds = [
    String(userId),
    ...(user.following || []).map((id) => String(id)),
  ];

  const reelLimit = Math.max(Math.floor(safeLimit / 2), 1);

  const [posts, reels] = await Promise.all([
    Post.find({
      user: { $in: followingIds },
    })
      .populate("user", "username profile_picture full_name")
      .populate("likes", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),

    Reel.find({
      user: { $in: followingIds },
    })
      .populate("user", "username profile_picture full_name")
      .sort({ createdAt: -1, views: -1 })
      .skip(skip)
      .limit(reelLimit)
      .lean(),
  ]);

  return {
    posts,
    reels,
    type: "following",
    page: safePage,
    limit: safeLimit,
  };
};

export const getForYouFeed = async (page = 1, limit = 10) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
  const skip = (safePage - 1) * safeLimit;
  const reelLimit = Math.max(Math.floor(safeLimit / 2), 1);

  const [posts, reels] = await Promise.all([
    Post.aggregate([
      {
        $addFields: {
          likesCount: { $size: { $ifNull: ["$likes", []] } },
          commentsCount: { $size: { $ifNull: ["$comments", []] } },
          ageInDays: {
            $divide: [{ $subtract: [new Date(), "$createdAt"] }, 86400000],
          },
        },
      },
      {
        $addFields: {
          score: {
            $subtract: [
              {
                $add: [
                  { $multiply: ["$likesCount", 4] },
                  { $multiply: ["$commentsCount", 2] },
                ],
              },
              "$ageInDays",
            ],
          },
        },
      },
      { $match: { likesCount: { $gte: 1 }, score: { $gte: 1 } } },
      { $sort: { score: -1, createdAt: -1 } },
      { $skip: skip },
      { $limit: safeLimit },
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
    ]),

    Reel.aggregate([
      {
        $addFields: {
          likesCount: { $size: { $ifNull: ["$likes", []] } },
          viewsCount: { $ifNull: ["$views", 0] },
          ageInDays: {
            $divide: [{ $subtract: [new Date(), "$createdAt"] }, 86400000],
          },
        },
      },
      {
        $addFields: {
          score: {
            $subtract: [
              {
                $add: [
                  { $multiply: ["$viewsCount", 1.5] },
                  { $multiply: ["$likesCount", 3] },
                ],
              },
              "$ageInDays",
            ],
          },
        },
      },
      { $match: { viewsCount: { $gte: 50 }, score: { $gte: 10 } } },
      { $sort: { score: -1, createdAt: -1 } },
      { $skip: skip },
      { $limit: reelLimit },
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
    ]),
  ]);

  return {
    posts,
    reels,
    type: "for_you",
    page: safePage,
    limit: safeLimit,
  };
};

export const getExploreFeed = async (topic = "", page = 1, limit = 10) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
  const skip = (safePage - 1) * safeLimit;

  const trendingPosts = await Post.aggregate([
    {
      $addFields: {
        likesCount: { $size: { $ifNull: ["$likes", []] } },
        commentsCount: { $size: { $ifNull: ["$comments", []] } },
      },
    },
    { $sort: { likesCount: -1, commentsCount: -1, createdAt: -1 } },
    { $skip: skip },
    { $limit: safeLimit },
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

  return {
    trending: trendingPosts,
    type: "explore",
    topic,
    page: safePage,
    limit: safeLimit,
  };
};