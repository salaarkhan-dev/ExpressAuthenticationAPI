import { NextFunction, Request, Response } from "express";
import { ErrorException } from "../errors/ErrorExceptions";
import User, { IUser } from "../models/User";
import sendToken from "../utils/jwtCookie";

export const regsiterUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { firstName, lastName, email, password }: IUser = req.body;
  const user = await User.create({
    firstName,
    lastName,
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
  const { email, password }: IUser = req.body;
  if (!email || !password) {
    return next(new ErrorException("Please provide email and password.", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(
      new ErrorException("Account with this email doesn't exist", 400)
    );
  }
  const isMatched = await user.comparePassword(password);
  if (!isMatched) {
    return next(new ErrorException("Invalid email or password", 401));
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
