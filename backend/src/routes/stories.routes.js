import express from 'express';
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from '../middlewares/upload.middleware.js';
import { 
  createStory, 
  getStoriesFeed, 
  markStoryAsSeen, 
  addStoryReaction 
} from '../controllers/story.controller.js';

const router = express.Router();

router.post('/', verifyJWT, upload.array('media', 5), createStory);
router.get('/feed', verifyJWT, getStoriesFeed);
router.post('/:storyId/seen', verifyJWT, markStoryAsSeen);
router.post('/:storyId/react', verifyJWT, addStoryReaction);

export default router;
