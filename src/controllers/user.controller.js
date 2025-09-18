import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
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
    coverImage: uploadedcoverImage?.secure_url || "",
    avatar: uploadedAvatar.secure_url,
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

export { registerUser, loginUser, logoutUser, refreshToken };
