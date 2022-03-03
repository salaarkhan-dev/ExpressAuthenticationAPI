import { Router } from "express";
import authRoutes from "./authRoutes";
import postRoutes from "./postRoutes";
import usersRoutes from "./usersRoutes";

const router: Router = Router();

// /api/auth/
router.use("/auth", authRoutes);
// /api/users
router.use("/users", usersRoutes);
// /api/posts
router.use("/posts", postRoutes);

export default router;
