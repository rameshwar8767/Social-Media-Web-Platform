import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getUserNotifications,
  markAllRead,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.use(verifyJWT);

router.get("/", getUserNotifications);
router.patch("/read-all", markAllRead);

export default router;