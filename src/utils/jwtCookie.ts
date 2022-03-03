import { CookieOptions, Response } from "express";
import Post from "../models/Post";
import { IUser } from "../models/User";

const sendToken = async (user: IUser, status: number, res: Response) => {
  const token = user.getJwtToken();
  const COOKIE_EXPIRES_TIME: number = Number.parseInt(
    process.env.COOKIE_EXPIRES_TIME || "7"
  );

  const cookieOptions: CookieOptions = {
    expires: new Date(Date.now() + COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  const { password, ...others } = user._doc;
  const posts = await Post.find({ user: user._id });
  others.posts = posts;

  res.status(status).cookie("token", token, cookieOptions).json({
    success: true,
    token,
    user: others,
  });
};

export default sendToken;
