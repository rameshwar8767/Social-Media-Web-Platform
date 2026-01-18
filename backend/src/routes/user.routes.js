import express from "express";
import {
  getMyProfile,
  getUserProfile,
  updateProfile,        // ✅ Need this controller
  toggleFollow,         // ✅ Need this controller  
  searchUsers,
} from "../controllers/user.controllers.js";  // Fixed: user.controller.js (singular)
import { verifyJWT } from "../middlewares/auth.middleware.js";  // Fixed: verifyJWT + path

const router = express.Router();

router.get("/me", verifyJWT, getMyProfile);
router.get("/search", verifyJWT, searchUsers);
router.get("/:username", verifyJWT, getUserProfile);
router.put("/profile", verifyJWT, updateProfile);
router.post("/:id/follow", verifyJWT, toggleFollow);  // Toggle follow/unfollow

export default router;
