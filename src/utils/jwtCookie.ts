import { CookieOptions, Response } from "express";
import { IUser } from "../models/User";

const sendToken = (user: IUser, status: number, res: Response) => {
  const token = user.getJwtToken();
  const COOKIE_EXPIRES_TIME: number = Number.parseInt(
    process.env.COOKIE_EXPIRES_TIME || "7"
  );

  const cookieOptions: CookieOptions = {
    expires: new Date(Date.now() + COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  res.status(status).cookie("token", token, cookieOptions).json({
    success: true,
    token,
    user,
  });
};

export default sendToken;
