import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.models.js";
import { Tweet } from "../models/tweet.models.js";
import { Video } from "../models/video.model.js";
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  if (!videoId) throw new ApiError("Video id is required", 400);
  const userId = req.user._id;
  const data = await Video.findById(videoId);
  if (!data) {
    throw new ApiError("No video data found");
  }
  const videoLikeInfo = await Like.findOne({
    $and: [{ likedBy: userId }, { video: videoId }],
  });
  if (!videoLikeInfo) {
    const data = await Like.create({
      video: videoId,
      likedBy: userId,
    });
    return res.status(200).json(new ApiResponse(200, "Video liked", data));
  } else {
    await Like.findOneAndDelete({
      $and: [
        {
          likedBy: userId,
        },
        {
          video: videoId,
        },
      ],
    });
    return res.status(200).json(new ApiResponse(200, "Video like removed", {}));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  //TODO: toggle like on video
  if (!commentId) throw new ApiError("Comment id is required", 400);
  const userId = req.user._id;
  const data = await Comment.findById(commentId);
  if (!data) {
    throw new ApiError("No comment data found");
  }
  const commentLikeInfo = await Like.findOne({
    $and: [{ likedBy: userId }, { comment: commentId }],
  });
  if (!commentLikeInfo) {
    const data = await Like.create({
      comment: commentId,
      likedBy: userId,
    });
    return res.status(200).json(new ApiResponse(200, "Comment liked", data));
  } else {
    await Like.findOneAndDelete({
      $and: [
        {
          likedBy: userId,
        },
        {
          comment: commentId,
        },
      ],
    });
    return res
      .status(200)
      .json(new ApiResponse(200, "Comment like removed", {}));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  //TODO: toggle like on comment
  //TODO: toggle like on video
  if (!tweetId) throw new ApiError("Tweet id is required", 400);
  const userId = req.user._id;
  const data = await Tweet.findById(tweetId);
  if (!data) {
    throw new ApiError("No tweet data found");
  }
  const tweetLikeInfo = await Like.findOne({
    $and: [{ likedBy: userId }, { tweet: tweetId }],
  });
  if (!tweetLikeInfo) {
    const data = await Like.create({
      tweet: tweetId,
      likedBy: userId,
    });
    return res.status(200).json(new ApiResponse(200, "Tweet liked", data));
  } else {
    await Like.findOneAndDelete({
      $and: [
        {
          likedBy: userId,
        },
        {
          tweet: tweetId,
        },
      ],
    });
    return res.status(200).json(new ApiResponse(200, "Tweet like removed", {}));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const userId = req.user._id;
  const { limit = 10, page = 1 } = req.query;
  if (!userId) {
    throw new ApiError("User id is required", 400);
  }
  const likedVideosInfo = await Like.aggregatePaginate(
    Like.aggregate([
      {
        $match: {
          likedBy: userId,
          video: { $exists: true },
        },
      },
      {
        $lookup: {
          as: "video",
          localField: "video",
          foreignField: "_id",
          from: "videos",
          pipeline: [
            {
              $lookup: {
                localField: "owner",
                foreignField: "_id",
                from: "users",
                as: "owner",
                pipeline: [
                  {
                    $project: {
                      username: 1,
                      fullName: 1,
                      avatar: 1,
                      email: 1,
                    },
                  },
                ],
              },
            },
            {
              $project: {
                thumbnail: 1,
                videoFile: 1,
                title: 1,
                duration: 1,
                owner: 1,
              },
            },
            {
              $addFields: {
                owner: { $first: "$owner" },
              },
            },
          ],
        },
      },
      {
        $addFields: {
          video: { $first: "$video" },
        },
      },
    ]),
    {
      page,
      limit,
    }
  );
  if (!likedVideosInfo) throw new ApiError("Something went wrong", 400);

  return res
    .status(200)
    .json(
      new ApiResponse(
        likedVideosInfo.length ? 200 : 400,
        "Liked videos data",
        likedVideosInfo
      )
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
