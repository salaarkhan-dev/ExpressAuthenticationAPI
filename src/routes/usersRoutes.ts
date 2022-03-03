import { Router } from "express";
import {
  deleteAccount,
  followUser,
  getRequestUser,
  getUserAccount,
  unfollowUser,
  updateAccount,
} from "../controllers/userControllers";
import asyncHandler from "../middlewares/asyncHandler";
import isAuthenticatedUser from "../middlewares/requestAuth";

const usersRoutes: Router = Router();

// api/users/me
usersRoutes.route("/me").get(isAuthenticatedUser, asyncHandler(getRequestUser));
usersRoutes.route("/me").put(isAuthenticatedUser, asyncHandler(updateAccount));
usersRoutes
  .route("/me")
  .delete(isAuthenticatedUser, asyncHandler(deleteAccount));

// api/users/:username
usersRoutes
  .route("/:username")
  .get(isAuthenticatedUser, asyncHandler(getUserAccount));

// api/users/:username/follow
usersRoutes
  .route("/:username/follow")
  .get(isAuthenticatedUser, asyncHandler(followUser));

// api/users/:username/unfollow
usersRoutes
  .route("/:username/unfollow")
  .get(isAuthenticatedUser, asyncHandler(unfollowUser));

export default usersRoutes;
