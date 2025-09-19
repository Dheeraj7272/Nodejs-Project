import asyncHandler from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

import { uploadToCloudinary } from "../utils/cloudinary";
import { Video } from "../models/video.model";

// Upload video

const uploadVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (!title.trim()) {
    throw new ApiError("Video title is required", 400);
  }

  const thumbnailPath = req.files?.thumbnail[0]?.path;
  if (!thumbnailPath) {
    throw new ApiError("Video thumbnail is required", 400);
  }
  const videoPath = req.fiels?.video[0]?.path;
  if (!videoPath) {
    throw new ApiError("Video file is required", 400);
  }
  const uploadedThumbnailPath = await uploadToCloudinary(thumbnailPath);
  const uploadedVideoPath = await uploadToCloudinary(videoPath);

  if (!uploadedThumbnailPath) {
    throw new ApiError("Something went wrong when uploading thumbnail", 500);
  }

  if (!uploadedVideoPath) {
    throw new ApiError("Something went wrong when uploading Video", 500);
  }

  const userId = req.user?._id;

  const video = await Video.create({
    title,
    description: description || "",
    videoFile: uploadedVideoPath.url,
    thumbnail: uploadedThumbnailPath.url,
    owner: userId,
    views: 0,
    duration: 0,
  });
  if (!video) {
    throw new ApiError("Video could not be uploaded", 500);
  }
  return res
    .status(200)
    .json(new ApiResponse("200", "Video successfully uploaded", video));
});

// Change publishity

const changeVideoPublicity = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError("Authentication failed", 401);
  }

  if (!videoId) {
    throw new ApiError("Video not found", 404);
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError("Video not found", 404);
  }

  if (video?.owner !== userId) {
    throw new ApiError("Invalid action", 401);
  }
  const newPublished = !video.isPublished;
  video.isPublished = !video.isPublished;
  await video.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        `Video is ${newPublished ? "published" : "private"}`,
        video
      )
    );
});
// delete video

// replace thumbnail
const replaceThumbnail = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError("Invalid video id", 400);
  }
  const uploadedThumbnailPath = req.files?.thumbnail?.[0]?.path;
  if (!uploadedThumbnailPath) {
    throw new ApiError("New thumbnail is required");
  }
  const newThumbnail = await uploadToCloudinary(uploadedThumbnailPath);
  if (!newThumbnail) {
    throw new ApiError("Something went wrong");
  }

  const userId = req.user?._id;
  const video = await Video.findById(videoId);

  if (video?.owner !== userId) {
    throw new ApiError("Invalid action", 401);
  }
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        thumbnail: newThumbnail.url,
      },
    },
    {
      new: true,
    }
  );
  if (!updatedVideo) {
    throw new ApiError("Video could not be uploaded", 500);
  }
  return res
    .status(200)
    .json(new ApiResponse("200", "Video successfully uploaded", updatedVideo));
});
// update details

const updateDetails = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError("Invalid video id", 400);
  }
  const { title, description } = req.body;
  if (!title.trim()) {
    throw new ApiError("Video title is required", 400);
  }

  const userId = req.user?._id;
  const video = await Video.findById(videoId);

  if (video?.owner !== userId) {
    throw new ApiError("Invalid action", 401);
  }
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title,
        description: description || "",
      },
    },
    {
      new: true,
    }
  );
  if (!updatedVideo) {
    throw new ApiError("Video could not be uploaded", 500);
  }
  return res
    .status(200)
    .json(new ApiResponse("200", "Video successfully uploaded", updatedVideo));
});
// replace video
const replaceVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError("Invalid video id", 400);
  }
  const uploadedVideoPath = req.files?.video?.[0]?.path;
  if (!uploadedVideoPath) {
    throw new ApiError("New Video file is required");
  }
  const newVideo = await uploadToCloudinary(uploadedVideoPath);
  if (!newVideo) {
    throw new ApiError("Something went wrong");
  }

  const userId = req.user?._id;
  const video = await Video.findById(videoId);

  if (video?.owner !== userId) {
    throw new ApiError("Invalid action", 401);
  }
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        thumbnail: newVideo.url,
      },
    },
    {
      new: true,
    }
  );
  if (!updatedVideo) {
    throw new ApiError("Video could not be uploaded", 500);
  }
  return res
    .status(200)
    .json(new ApiResponse("200", "Video successfully uploaded", updatedVideo));
});
export {
  uploadVideo,
  changeVideoPublicity,
  replaceThumbnail,
  updateDetails,
  replaceVideo,
};
