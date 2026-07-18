import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import {
  getAdminDashboard,
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getAllPosts,
  deletePost,
  getReportedContent,
} from "../controllers/admin.controller.js";

const router = Router();

router.use(verifyJWT, verifyAdmin);

/* DASHBOARD */
router.get("/dashboard", getAdminDashboard);

/* USERS */
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/status", updateUserStatus);
router.delete("/users/:id", deleteUser);

/* POSTS */
router.get("/posts", getAllPosts);
router.delete("/posts/:id", deletePost);

/* REPORTS / MODERATION */
router.get("/reports", getReportedContent);

export default router;