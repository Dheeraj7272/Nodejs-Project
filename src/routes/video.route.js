import { Router } from "express";
import {
  changeVideoPublicity,
  getAllVideos,
  removeVideo,
  replaceThumbnail,
  replaceVideo,
  updateDetails,
  uploadVideo,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middlewares.js";

const videoRouter = Router();

videoRouter.route("/create-video").post(
  verifyJWT,
  upload.fields([
    {
      name: "thumbnail",
      maxCount: 1,
    },
    {
      name: "video",
      maxCount: 1,
    },
  ]),
  uploadVideo
);

videoRouter
  .route("/:videoId/change-publicity")
  .patch(verifyJWT, changeVideoPublicity);
videoRouter.route("/:videoId/update-details").patch(verifyJWT, updateDetails);
videoRouter
  .route("/:videoId/replace-thumbnail")
  .patch(verifyJWT, upload.single("thumbnail"), replaceThumbnail);
videoRouter
  .route("/:videoId/replace-video")
  .patch(verifyJWT, upload.single("video"), replaceVideo);
videoRouter.route("/:videoId/delete").delete(verifyJWT, removeVideo);
videoRouter.route("/").get(verifyJWT, getAllVideos);
export default videoRouter;
