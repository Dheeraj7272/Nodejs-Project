import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, username, email, password } = req.body;
  // Logic for registering user
  console.log(fullName, username, email, password);

  if (
    [fullName, username, email, password].some(
      (field) => field === undefined || field.trim() === ""
    )
  ) {
    throw new ApiError("All fields are required", 400);
  }
  // Check if user already exists
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new ApiError("User already exists", 400);
  }
  // Check if invalid email
  // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // if(!emailRegex.test(email)){
  //   throw new ApiError("Invalid email address", 400)
  // }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError("Avatar file is required", 400);
  }
  const uploadedAvatar = await uploadToCloudinary(avatarLocalPath);
  if (!uploadedAvatar) {
    throw new ApiError("Failed to upload avatar image", 500);
  }
  let uploadedcoverImage = null;
  if (coverImageLocalPath) {
    uploadedcoverImage = await uploadToCloudinary(coverImageLocalPath);
  }
  console.log(uploadedAvatar.secure_url);

  const user = await User.create({
    fullName,
    username: username.toLowerCase(),
    email,
    password,
    coverImage: uploadedcoverImage?.url || "",
    avatar: uploadedAvatar.url,
  });

  const userCreated = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!userCreated) {
    throw new ApiError(
      "Failed to create user whilte registering the user",
      500
    );
  }
  return res
    .status(201)
    .json(new ApiResponse(201, "User registered successfully", userCreated));
});

const getAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAcessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError("Failed to generate tokens", 500);
  }
};
const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  // Logic for logging in user

  if (!(username || email) || !password) {
    throw new ApiError("Username or email and password are required", 400);
  }
  const user = await User.findOne({ $or: [{ username }, { email }] });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const isPasswordCorrect = await User.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError("Invalid password", 400);
  }

  const { accessToken, refreshToken } = await getAccessTokenAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(200, "User logged in ", {
        user: loggedInUser,
        accessToken,
        refreshToken,
      })
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 },
    },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .status(200)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!token) {
    throw new ApiError("Refresh token not found", 401);
  }
  const decoded = jwt.verify(token, process.env.REFRESH_ACCESS_TOKEN_SECRET);
  if (!decoded?._id) {
    throw new ApiError("Invalid refresh token", 401);
  }

  const user = await User.findById(decoded?._id).select(
    "-password -refreshToken"
  );
  if (!user || user.refreshToken !== token) {
    throw new ApiError("Invalid refresh token", 401);
  }

  const { accessToken, newRefreshToken } = await getAccessTokenAndRefreshToken(
    user._id
  );
  const options = { httpOnly: true, secure: true };
  return res
    .status(200)
    .cookie("refreshToken", newRefreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(new ApiResponse(200, { accessToken, refreshToken, userData: user }));
});

const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  const newPasswordIsSameAsOld = await user.isPasswordCorrect(newPassword);
  if (!isPasswordCorrect) {
    throw new ApiError("Old password is incorrect", 400);
  }
  if (newPasswordIsSameAsOld) {
    throw new ApiError("New password is same as old password", 400);
  }
  // const user = await User.findById
  user.password = newPassword;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "password updated successfully", {}));
});

const getCurrentUser = asyncHandler(async (req, req) => {
  return res
    .status(200)
    .json(new ApiResponse(200, "Current user fetched successfully", req.user));
});

const updateUserProfile = async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiError("Full name and email are required", 400);
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, "user profile updated successfully", user));
};

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError("Avatar file is required", 400);
  }
  const uploadedAvatar = await uploadToCloudinary(avatarLocalPath);
  if (!uploadedAvatar?.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: uploadedAvatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, "User avatar updated successfully", user));
});
const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError("coverImage file is required", 400);
  }
  const uploadedCoverImage = await uploadToCloudinary(coverImageLocalPath);
  if (!uploadedCoverImage?.url) {
    throw new ApiError(400, "Error while uploading on coverImage");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: uploadedCoverImage.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, "User cover Image updated successfully", user));
});

const getChannelInfo = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) {
    throw new ApiError("Username is required", 400);
  }
  const channel = await User.aggregate([
    {
      $match: {
        username: username.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "channelsSubscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$channelsSubscribedTo",
        },
        isSubscriber: {
          $cond: {
            if: {
              $in: [req.user?._id, "$subscribers.subscriber"],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        email: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        avatar: 1,
        coverImage: 1,
        isSubscriber: 1,
      },
    },
  ]);
  if (!channel?.length) {
    throw new ApiError("Channel not found", 404);
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "channel data fetched successfully", channel[0])
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: { _id: mongoose.Types.ObjectId(req.user._id) },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
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
        ],
      },
    },
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, "Watch history fetched successfully", user[0].watchHistory));
});
export {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  getCurrentUser,
  updateUserProfile,
  updateCoverImage,
  updateUserAvatar,
  updatePassword,
  getChannelInfo,
  getWatchHistory
};
