import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getUserChats,
  getChatMessages,
  sendTextMessage,
  markMessagesRead,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.use(verifyJWT);

router.get("/", getUserChats);
router.get("/:chatId/messages", getChatMessages);
router.post("/:chatId/messages", sendTextMessage);
router.patch("/:chatId/read", markMessagesRead);

export default router;