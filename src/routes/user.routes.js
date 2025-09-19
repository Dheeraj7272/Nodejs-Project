import { Router } from "express";
import {
  getChannelInfo,
  getCurrentUser,
  getWatchHistory,
  loginUser,
  logoutUser,
  refreshToken,
  registerUser,
  updateCoverImage,
  updatePassword,
  updateUserAvatar,
  updateUserProfile,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

userRouter.route("/login").post(loginUser);

// Secured route
userRouter.route("/logout").post(verifyJwt, logoutUser);
userRouter.route("/refresh-token").post(refreshToken);
userRouter.route("/current-user").get(verifyJwt, getCurrentUser);
userRouter
  .route("/avatar")
  .patch(verifyJwt, upload.single("avatar"), updateUserAvatar);
userRouter
  .route("/cover-image")
  .patch(verifyJwt, upload.single("coverImage"), updateCoverImage);
userRouter.route("/update-account").patch(verifyJwt, updateUserProfile);
userRouter.route("/change-password").patch(verifyJwt, updatePassword);
userRouter.route("/:username").get(verifyJwt, getChannelInfo);
userRouter.route("/watch-history").get(verifyJwt, getWatchHistory);
export default userRouter;
