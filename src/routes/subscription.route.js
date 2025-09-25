import { Router } from "express";
import {
  getChannelSubscriptions,
  getSubscribedChannels,
  toggleSubscription,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const subscriptionRouter = Router();

subscriptionRouter.use(verifyJWT);
subscriptionRouter.route("/:username").patch(verifyJWT, toggleSubscription);
subscriptionRouter.route("/c/:subscribedId").get(getSubscribedChannels);
subscriptionRouter.route("/s/:channelId").get(getChannelSubscriptions);
export default subscriptionRouter;
