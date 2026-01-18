import express from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { 
  getUserChats, 
  getChatMessages,
  sendTextMessage 
} from '../controllers/chat.controller.js';

const router = express.Router();

router.get('/', verifyJWT, getUserChats);
router.get('/:chatId/messages', verifyJWT, getChatMessages);
router.post('/:chatId/message', verifyJWT, sendTextMessage);

export default router;
