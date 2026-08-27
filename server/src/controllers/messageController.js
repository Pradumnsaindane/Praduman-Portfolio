import asyncHandler from 'express-async-handler';
import Message from '../models/Message.js';

// @route  POST /api/messages
// @access Public (rate-limited)
export const createMessage = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;
  const doc = await Message.create({ name, email, message });
  res.status(201).json({ message: 'Thanks — your message came through. I’ll reply soon.', id: doc._id });
});

// @route  GET /api/messages
// @access Private
export const getMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 });
  const unread = messages.filter((m) => !m.read).length;
  res.json({ count: messages.length, unread, messages });
});

// @route  PATCH /api/messages/:id/read
// @access Private
export const toggleRead = asyncHandler(async (req, res) => {
  const msg = await Message.findById(req.params.id);
  if (!msg) {
    res.status(404);
    throw new Error('Message not found');
  }
  msg.read = typeof req.body.read === 'boolean' ? req.body.read : !msg.read;
  await msg.save();
  res.json(msg);
});

// @route  DELETE /api/messages/:id
// @access Private
export const deleteMessage = asyncHandler(async (req, res) => {
  const msg = await Message.findByIdAndDelete(req.params.id);
  if (!msg) {
    res.status(404);
    throw new Error('Message not found');
  }
  res.json({ message: 'Message removed', id: req.params.id });
});
