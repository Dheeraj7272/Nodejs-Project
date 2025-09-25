import { Router } from "express";
import {
  getChannelSubscriptions,
  getSubscribedChannels,
  toggleSubscription,
} from "../controllers/subscription.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const subscriptionRouter = Router();

subscriptionRouter.use(verifyJwt);
subscriptionRouter.route("/:username").patch(verifyJwt, toggleSubscription);
subscriptionRouter.route("/c/:subscribedId").get(getSubscribedChannels);
subscriptionRouter.route("/s/:channelId").get(getChannelSubscriptions);
export default subscriptionRouter;
