import { Router } from "express";
import {
  loginUser,
  logoutUser,
  regsiterUser,
} from "../controllers/authControllers";
import asyncHandler from "../middlewares/asyncHandler";

const authRoutes: Router = Router();

// api/auth/register
authRoutes.route("/register").post(asyncHandler(regsiterUser));
// api/auth/login
authRoutes.route("/login").post(asyncHandler(loginUser));
// api/auth/logout
authRoutes.route("/logout").get(asyncHandler(logoutUser));

export default authRoutes;
