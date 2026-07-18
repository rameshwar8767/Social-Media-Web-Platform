import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import {
  createReel,
  getReelsFeed,
  likeUnlikeReel,
  incrementView,
  deleteReel,
} from "../controllers/reel.controller.js";

const router = express.Router();

router.use(verifyJWT);

router.post(
  "/",
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  createReel
);

router.get("/feed", getReelsFeed);
router.patch("/:reelId/like", likeUnlikeReel);
router.post("/:reelId/view", incrementView);
router.delete("/:reelId", deleteReel);

export default router;