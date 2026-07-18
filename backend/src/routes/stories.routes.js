import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import {
  createStory,
  getStoriesFeed,
  markStoryAsSeen,
  addStoryReaction,
} from "../controllers/story.controller.js";

const router = express.Router();

router.use(verifyJWT);

router.post("/", upload.array("media", 5), createStory);
router.get("/feed", getStoriesFeed);
router.post("/:storyId/seen", markStoryAsSeen);
router.post("/:storyId/react", addStoryReaction);

export default router;