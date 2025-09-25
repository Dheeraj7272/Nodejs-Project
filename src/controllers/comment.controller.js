import mongoose from "mongoose";
import { Comment } from "../models/comment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError("Video not found", 400);
  }
  const { page = 1, limit = 10 } = req.query;
  const commentsData = await Comment.aggregatePaginate(
    Comment.aggregate([
      { $match: { video: new mongoose.Types.ObjectId(videoId) } },
      {
        $lookup: {
          from: "users",
          foreignField: "_id",
          localField: "owner",
          as: "owner",
          pipeline: [
            {
              $project: {
                username: 1,
                fullname: 1,
                avatar: 1,
                email: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          owner: { $first: "$owner" },
        },
      },
    ]),
    {
      page,
      limit,
    }
  );
  if (!commentsData) throw new ApiError("No comments found", 404);
  return res
    .status(200)
    .json(new ApiResponse(200, "Comments data found", commentsData));
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { content } = req.body;
  if (!content || content.trim() === "") {
    throw new ApiError("Comment should not be empty", 400);
  }
  if (!videoId) throw new ApiError("No video found", 400);
  const alreadyCommentData = await Comment.find({
    $and: [{ video: videoId }, { owner: req.user._id }],
  });
  if (alreadyCommentData && alreadyCommentData.length != 0) {
    console.log(alreadyCommentData);
    throw new ApiError("Can not add more than one comment", 400);
  }
  const commentData = await Comment.create({
    owner: req.user._id,
    video: videoId,
    content,
  });

  if (!commentData) throw new ApiError("Something went wrong", 500);
  return res
    .status(200)
    .json(new ApiResponse(200, "Comment added", commentData));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { content } = req.body;
  const { commentId } = req.params;
  if (!content || content.trim() === "") {
    throw new ApiError("Comment should not be empty", 400);
  }
  if (!commentId) throw new ApiError("No video found", 400);

  const commentData = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content,
      },
    },
    { new: true }
  );
  if (!commentData) throw new ApiError("Something went wrong", 500);
  return res
    .status(200)
    .json(new ApiResponse(200, "Comment updated", commentData));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  if (!commentId) throw new ApiError("No comment Id found", 400);

  const deletedCommentData = await Comment.findByIdAndDelete(commentId);
  if (!deletedCommentData) throw new ApiError("Something went wrong", 500);
  return res
    .status(200)
    .json(
      new ApiResponse(200, "Comment removed from the video", deletedCommentData)
    );
});

export { getVideoComments, addComment, updateComment, deleteComment };
