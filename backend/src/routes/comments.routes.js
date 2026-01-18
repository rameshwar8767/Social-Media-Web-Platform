import express from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { addComment, getComments, likeComment, deleteComment } from '../controllers/comment.controller.js';

const router = express.Router();

router.post('/', verifyJWT, addComment);
router.get('/', verifyJWT, getComments);
router.patch('/:commentId/like', verifyJWT, likeComment);
router.delete('/:commentId', verifyJWT, deleteComment);

export default router;
