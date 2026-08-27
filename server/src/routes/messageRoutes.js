import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  createMessage,
  getMessages,
  toggleRead,
  deleteMessage,
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Keep the public contact endpoint from being abused as a spam relay.
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { message: 'You’ve sent a few messages already — please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.route('/').post(contactLimiter, createMessage).get(protect, getMessages);
router.patch('/:id/read', protect, toggleRead);
router.delete('/:id', protect, deleteMessage);

export default router;
