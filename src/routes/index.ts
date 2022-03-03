import { Router } from "express";
import authRoutes from "./authRoutes";
import usersRoutes from "./usersRoutes";

const router: Router = Router();

// /api/auth/
router.use("/auth", authRoutes);
// /api/users
router.use("/users", usersRoutes);

export default router;
