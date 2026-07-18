import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addComment,
  getComments,
  likeComment,
  deleteComment,
} from "../controllers/comment.controller.js";

const router = express.Router();

router.use(verifyJWT);

router.route("/")
  .post(addComment)
  .get(getComments);

router.patch("/:commentId/like", likeComment);
router.delete("/:commentId", deleteComment);

export default router;