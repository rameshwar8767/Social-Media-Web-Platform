import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getHomeFeed, getExplore } from "../controllers/feed.controller.js";
import { cacheMiddleware } from "../middlewares/redis.middleware.js";

const router = express.Router();

router.use(verifyJWT);

router.get("/home", cacheMiddleware(300), getHomeFeed);
router.get("/explore", getExplore);

export default router;