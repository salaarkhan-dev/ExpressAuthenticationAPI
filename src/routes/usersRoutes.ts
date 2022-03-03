import { Router } from "express";
import { getUser } from "../controllers/userControllers";
import asyncHandler from "../middlewares/asyncHandler";

const usersRoutes: Router = Router();

// api/users/
usersRoutes.route("/").get(asyncHandler(getUser));

export default usersRoutes;
