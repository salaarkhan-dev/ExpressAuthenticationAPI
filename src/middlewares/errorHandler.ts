import { NextFunction, Request, Response } from "express";
import { ErrorException } from "../errors/ErrorExceptions";

const errorHandler = (
  err: ErrorException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.status = err.status || 500;
  err.message = err.message || "Internal Server Error";
  if (process.env.NODE_ENV === "DEVELOPMENT") {
    res.status(err.status).json({
      success: false,
      status: err.status,
      message: err.message,
      stack: err.stack,
      metaData: err.metaData,
    });
  }
  if (process.env.NODE_ENV === "PRODUCTION") {
    res.status(err.status).json({
      success: false,
      status: err.status,
      message: err.message,
    });
  }
};

export default errorHandler;
