import express from 'express';
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from '../middlewares/upload.middleware.js';
import { createPost, getFeed, likeUnlikePost } from '../controllers/post.controller.js';

const router = express.Router();

router.post('/', verifyJWT, upload.array('media', 10), createPost);
router.get('/feed', verifyJWT, getFeed);
router.patch('/:postId/like', verifyJWT, likeUnlikePost);

export default router;
