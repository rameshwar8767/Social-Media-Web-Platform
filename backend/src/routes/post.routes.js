import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import {
  createPost,
  getFeed,
  likeUnlikePost,
  deletePost,
} from "../controllers/post.controller.js";

const router = express.Router();

router.use(verifyJWT);

router.post("/", upload.array("media", 10), createPost);
router.get("/feed", getFeed);
router.patch("/:postId/like", likeUnlikePost);
router.delete("/:postId", deletePost);

export default router;