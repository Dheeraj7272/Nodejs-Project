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
import { verifyJWT } from "../middlewares/auth.middleware.js";

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
userRouter.route("/logout").post(verifyJWT, logoutUser);
userRouter.route("/refresh-token").post(refreshToken);
userRouter.route("/current-user").get(verifyJWT, getCurrentUser);
userRouter
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
userRouter
  .route("/cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateCoverImage);
userRouter.route("/update-account").patch(verifyJWT, updateUserProfile);
userRouter.route("/change-password").patch(verifyJWT, updatePassword);
userRouter.route("/:username").get(verifyJWT, getChannelInfo);
userRouter.route("/watch-history").get(verifyJWT, getWatchHistory);
export default userRouter;
