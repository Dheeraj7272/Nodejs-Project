import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {User} from "../models/user.models.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser =  asyncHandler(async (req, res) => {
  const {fullname,username,email,password} = req.body
  // Logic for registering user
  if([fullname,username,email,password].some((field) => field === undefined || field.trim() === "")){
    throw new ApiError("All fields are required", 400)
  }
  // Check if user already exists
  const existingUser = await User.findOne({$or: [{email}, {username}]})
  if(existingUser){
    throw new ApiError("User already exists", 400)
  }
  // Check if invalid email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;  
  if(!emailRegex.test(email)){
    throw new ApiError("Invalid email address", 400)
  }
 
 const avatarLocalPath= req.files?.avatar[0]?.path
 const coverimageLocalPath= req.files?.coverimage[0]?.path

 if(!avatarLocalPath){
  throw new ApiError("Avatar file is required", 400)
 }
  const uploadedAvatar = await uploadToCloudinary(avatarLocalPath);
  if(!uploadedAvatar){ 
    throw new ApiError("Failed to upload avatar image", 500);
  }
  const uploadedCoverImage = await uploadToCloudinary(coverimageLocalPath);
  if(!uploadedCoverImage){
    throw new ApiError("Failed to upload cover image", 500);
  }
  console.log(uploadedAvatar.secure_url);
  
  const user = await User.create({
    fullname,
    username:username.toLowerCase(),
    email,
    password,
    coverimage: uploadedCoverImage.secure_url || "",
    avatar: uploadedAvatar.secure_url,
  })
  
  const userCreated = await User.findById(user._id).select("-password -refreshToken");
  if(!userCreated){
    throw new ApiError("Failed to create user whilte registering the user", 500);
  };
  return res.status(201).json(new ApiResponse(201, "User registered successfully", userCreated));

});

export { registerUser };