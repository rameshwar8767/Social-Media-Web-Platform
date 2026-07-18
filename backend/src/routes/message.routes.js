import express from "express";
import { sendMessage, markMessagesAsSeen } from "../controllers/message.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyJWT);

router.post("/", sendMessage);
router.patch("/:chatId/seen", markMessagesAsSeen);

export default router;