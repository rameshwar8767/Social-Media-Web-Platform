import express from 'express';
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getUserNotifications, markAllRead } from '../controllers/notification.controller.js';

const router = express.Router();

router.get('/', verifyJWT, getUserNotifications);
router.patch('/read-all', verifyJWT, markAllRead);

export default router;
