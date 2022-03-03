import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ErrorException } from "../errors/ErrorExceptions";
import User from "../models/User";

const isAuthenticatedUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { token } = req.cookies;

  if (!token) {
    return next(
      new ErrorException("Login first to get access to the resources", 401)
    );
  }
  const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
  const user = await User.findById(decoded["id"]);
  if (!user) {
    return next(
      new ErrorException("Login first to get access to the resources", 401)
    );
  }
  req.user = user;
  next();
};

export default isAuthenticatedUser;
