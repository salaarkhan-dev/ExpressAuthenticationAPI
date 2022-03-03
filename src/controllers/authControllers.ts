import { NextFunction, Request, Response } from "express";
import { ErrorException } from "../errors/ErrorExceptions";
import User, { IUser } from "../models/User";
import sendToken from "../utils/jwtCookie";

export const regsiterUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { fullname, email, username, password }: IUser = req.body;
  const user = await User.create({
    fullname,
    username,
    email,
    password,
    avatar: {
      public_id: "samples/people/boy-snow-hoodie.jpg",
      url: "https://res.cloudinary.com/dnpxalm5i/image/upload/v1644127064/samples/people/boy-snow-hoodie.jpg",
    },
  });

  sendToken(user, 200, res);
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, password }: IUser = req.body;
  if (!username || !password) {
    return next(
      new ErrorException("Please provide username and password.", 400)
    );
  }
  const user = await User.findOne({ username }).select("+password");
  if (!user) {
    return next(
      new ErrorException("Account with this  username doesn't exist", 400)
    );
  }
  const isMatched = await user.comparePassword(password);
  if (!isMatched) {
    return next(new ErrorException("Invalid username or password", 401));
  }
  sendToken(user, 200, res);
};

export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};
