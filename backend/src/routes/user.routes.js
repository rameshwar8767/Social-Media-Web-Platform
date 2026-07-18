import express from "express";
import {
  getMyProfile,
  getUserProfile,
  updateProfile,
  toggleFollow,
  searchUsers,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyJWT);

router.get("/me", getMyProfile);
router.get("/search", searchUsers);
router.put("/profile", updateProfile);
router.post("/:id/follow", toggleFollow);
router.get("/:username", getUserProfile);

export default router;