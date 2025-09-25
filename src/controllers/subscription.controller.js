import mongoose from "mongoose";
import { Subscription } from "../models/subscriber.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import subscriptionRouter from "../routes/subscription.route.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  console.log(req.user);
  const userId = req.user._id;

  const { username } = req.params;
  console.log(username, "username");
  if (!userId) {
    throw new ApiError("User must login", 400);
  }
  const channelInfo = await User.findOne({ username });
  if (!channelInfo) throw new ApiError("Channel data not found");
  const isCurrenUserSubscribedToChannel = await Subscription.findOne({
    $and: [{ channel: channelInfo._id }, { subscriber: userId }],
  });
  console.log(
    isCurrenUserSubscribedToChannel,
    "isCurrenUserSubscribedToChannel"
  );
  if (isCurrenUserSubscribedToChannel) {
    await Subscription.findOneAndDelete({
      $and: [{ channel: channelInfo._id }, { subscriber: userId }],
    });
    await User.findByIdAndUpdate(
      channelInfo._id,
      {
        $s: {
          subcount: -1,
        },
      },
      {
        new: true,
      }
    );
    return res.status(200).json(new ApiResponse(200, "Channel unsubscribed"));
  } else {
    await Subscription.create({
      subscriber: userId,
      channel: channelInfo._id,
    });
    await User.findByIdAndUpdate(
      channelInfo._id,
      {
        $s: {
          subcount: 1,
        },
      },
      {
        new: true,
      }
    );
    res.status(200).json(new ApiResponse(200, "Channel subscribed"));
  }
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscribedId } = req.params;
  const { limit = 10, page = 1 } = req.query;
  if (!subscribedId) {
    throw new ApiError("User must be logged in", 400);
  }
  const subscriber = await User.findById(subscribedId);
  if (!subscriber) {
    throw new ApiError("User must be logged in", 400);
  }

  const subscribedChannels = await Subscription.aggregatePaginate(
    Subscription.aggregate([
      {
        $match: {
          subscriber: new mongoose.Types.ObjectId(subscribedId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "channel",
          foreignField: "_id",
          as: "channelInfo",
          pipeline: [
            {
              $project: {
                fullName: 1,
                username: 1,
                channelsSubscribedToCount: 1,
                avatar: 1,
                coverImage: 1,
                subcount: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          channelInfo: { $first: "$channelInfo" },
        },
      },
      {
        $project: {
          channelInfo: 1,
          username: 1,
          channelsSubscribedToCount: 1,
          avatar: 1,
          coverImage: 1,
          _id: 0,
        },
      },
    ]),
    {
      limit,
      page,
    }
  );
  if (!subscribedChannels) throw new ApiError("Something went wrong", 500);
  if (subscribedChannels.length == 0)
    return res
      .status(200)
      .json(new ApiResponse(200, "No subscribed channels", []));
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "subscribed channels information found",
        subscribedChannels
      )
    );
});

const getChannelSubscriptions = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const { limit = 10, page = 1 } = req.query;
  if (!channelId) {
    throw new ApiError("User must be logged in", 400);
  }
  const subscriber = await User.findById(channelId);
  if (!subscriber) {
    throw new ApiError("User must be logged in", 400);
  }

  const subscribedChannels = await Subscription.aggregatePaginate(
    Subscription.aggregate([
      {
        $match: {
          channel: new mongoose.Types.ObjectId(channelId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "subscriber",
          foreignField: "_id",
          as: "channelInfo",
          pipeline: [
            {
              $project: {
                fullName: 1,
                username: 1,
                channelsSubscribedToCount: 1,
                avatar: 1,
                coverImage: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          channelInfo: { $first: "$channelInfo" },
        },
      },
      {
        $project: {
          channelInfo: 1,
          username: 1,
          channelsSubscribedToCount: 1,
          avatar: 1,
          coverImage: 1,
          _id: 0,
        },
      },
    ]),
    {
      limit,
      page,
    }
  );
  if (!subscribedChannels) throw new ApiError("Something went wrong", 500);
  if (subscribedChannels.length == 0)
    return res
      .status(200)
      .json(new ApiResponse(200, "No subscribed channels", []));
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "subscribed channels information found",
        subscribedChannels
      )
    );
});

export { toggleSubscription, getSubscribedChannels, getChannelSubscriptions };
