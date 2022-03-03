import { NextFunction, Request, Response } from "express";
import { ErrorException } from "../errors/ErrorExceptions";
import Notification from "../models/Notification";
import Post from "../models/Post";
import User from "../models/User";

// getRequestUser
export const getRequestUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const posts = await Post.find({ user: req.user._id });
  const newUser: any = req.user;
  newUser.posts = posts;
  return res.status(200).json({
    success: true,
    user: newUser,
  });
};

// Update Account [Own]
export const updateAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: req.body,
    },
    { new: true }
  );
  if (!user)
    return next(
      new ErrorException("Error occured while updating account", 403)
    );
  return res.status(200).json({
    success: true,
    msg: "Account updated successfully!",
    user,
  });
};
// Delete Account [Own]
export const deleteAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    return res.status(204).send("Account delete successfully!");
  } catch (err) {
    return next(
      new ErrorException("Error occured while deleting account", 403, err)
    );
  }
};
// getUserID /:username
export const getUserAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate("followers")
      .populate("followings");
    const posts = await Post.find({ user: user?._id });

    if (!user)
      return next(
        new ErrorException(
          `Account with username "${req.params.username}" doesn't exist!`,
          403
        )
      );
    const { password, ...others } = user._doc;
    others.posts = posts;
    return res.status(200).json({
      success: true,
      user: others,
    });
  } catch (err) {
    return next(
      new ErrorException("Error occured while fetching account", 403, err)
    );
  }
};
// follow user  [Request User -> /:username/follow]
export const followUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user.username === req.params.username) {
      return next(new ErrorException(`You can't follow yourself!`, 403));
    }
    const user = await User.findOne({ username: req.params.username });
    const currentUser = req.user;

    if (!user)
      return next(
        new ErrorException(
          `Account with username "${req.params.username}" doesn't exist!`,
          403
        )
      );

    if (!user.followers?.includes(currentUser._id)) {
      await user.updateOne({ $push: { followers: currentUser._id } });
      await currentUser.updateOne({ $push: { followings: user._id } });

      // Create Notification
      const message = `${currentUser.username} started following you.`;
      const followUserNoti = await Notification.create({
        sender: currentUser._id,
        receiver: [user._id],
        message,
      });
      req.io.sockets.emit("notification", followUserNoti);
      return res.status(200).json({
        success: true,
        msg: `You followed ${req.params.username}.`,
        followUserNoti,
      });
    } else {
      return next(
        new ErrorException(`You already followed ${req.params.username}`, 403)
      );
    }
  } catch (err) {
    return next(
      new ErrorException("Error occured during following an account", 403, err)
    );
  }
};
// unfollow user [Request User -> /:id/unfollow]
export const unfollowUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user.username === req.params.username) {
      return next(new ErrorException(`You can't unfollow yourself!`, 403));
    }
    const user = await User.findOne({ username: req.params.username });
    const currentUser = req.user;

    if (!user)
      return next(
        new ErrorException(
          `Account with username "${req.params.username}" doesn't exist!`,
          403
        )
      );

    if (user.followers?.includes(currentUser._id)) {
      await user.updateOne({ $pull: { followers: currentUser._id } });
      await currentUser.updateOne({ $pull: { followings: user._id } });
      return res.status(200).json({
        success: true,
        msg: `You unfollowed ${req.params.username}.`,
      });
    } else {
      return next(
        new ErrorException(`You already unfollowed ${req.params.username}`, 403)
      );
    }
  } catch (err) {
    return next(
      new ErrorException(
        "Error occured during unfollowing an account",
        403,
        err
      )
    );
  }
};
