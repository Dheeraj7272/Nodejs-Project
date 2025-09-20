import { Router } from "express";
import {
  changeVideoPublicity,
  removeVideo,
  replaceThumbnail,
  replaceVideo,
  updateDetails,
  uploadVideo,
} from "../controllers/video.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middlewares.js";

const videoRouter = Router();

videoRouter.route("/create-video").post(
  verifyJwt,
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
  .patch(verifyJwt, changeVideoPublicity);
videoRouter.route("/:videoId/update-details").patch(verifyJwt, updateDetails);
videoRouter
  .route("/:videoId/replace-thumbnail")
  .patch(verifyJwt, upload.single("thumbnail"), replaceThumbnail);
videoRouter
  .route("/:videoId/replace-video")
  .patch(verifyJwt, upload.single("video"), replaceVideo);
videoRouter.route("/:videoId/delete").delete(verifyJwt,removeVideo);
export default videoRouter;
