import { NextFunction, Request, Response } from "express";

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(200).json({
    success: true,
  });
};
