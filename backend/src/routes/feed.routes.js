import express from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { getHomeFeed, getExplore } from '../controllers/feed.controller.js';
import { cacheMiddleware } from '../middlewares/redis.middlware.js';

const router = express.Router();

router.get('/home', verifyJWT, cacheMiddleware(300), getHomeFeed);  // ?tab=following|for_you
router.get('/explore', verifyJWT, getExplore);  // ?q=hashtag

export default router;
