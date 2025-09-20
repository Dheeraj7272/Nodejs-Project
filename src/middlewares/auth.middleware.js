import jwt from "jsonwebtoken"
import asyncHandler from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";

export const verifyJwt = asyncHandler(async(req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if(!token){
            throw new ApiError("Access token not found", 401);
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const userData = await User.findById(decoded._id).select("-password -refreshToken");
        if(!userData){
            throw new ApiError("User not found", 404);
        }
        req.user = userData;
        next();
    } catch (error) {
        throw new ApiError(error?.message ||"Invalid accessToken", 401)
    }

})

