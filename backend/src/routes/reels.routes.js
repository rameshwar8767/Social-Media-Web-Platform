import express from 'express';
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from '../middlewares/upload.middleware.js';
import { createReel, getReelsFeed, likeUnlikeReel, incrementView } from '../controllers/reel.controller.js';

const router = express.Router();

router.post('/', verifyJWT, upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), createReel);

router.get('/feed', verifyJWT, getReelsFeed);
router.patch('/:reelId/like', verifyJWT, likeUnlikeReel);
router.post('/:reelId/view', verifyJWT, incrementView);

export default router;
