import express from 'express';
import User from '../models/User.js';
import Message from '../models/Message.js';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

const router = express.Router();

// Cloudinary config
cloudinary.config({
  cloud_name: 'dbfbnv0oi',
  api_key: '769118879736532',
  api_secret: 'n1Pyq8U1ZeIDyyRLsd4HZlRqbac'
});

const upload = multer({ dest: 'uploads/' });

// Search users
router.get('/users/search', async (req, res) => {
  try {
    const { query } = req.query;
    const users = await User.find({
      username: { $regex: query, $options: 'i' },
      _id: { $ne: req.session.userId }
    }).select('username isOnline lastSeen').limit(10);
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages between users
router.get('/messages/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.session.userId;
    
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ],
      $and: [
        { deletedForAll: false },
        { 'deletedFor.user': { $ne: currentUserId } }
      ]
    })
    .populate('sender receiver', 'username')
    .sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload image
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    res.json({ imageUrl: result.secure_url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark messages as read
router.put('/messages/:messageId/read', async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.messageId, {
      isRead: true,
      readAt: new Date()
    });
    res.json({ message: 'Message marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add reaction to message
router.post('/messages/:messageId/react', async (req, res) => {
  try {
    const { emoji } = req.body;
    const messageId = req.params.messageId;
    const userId = req.session.userId;
    
    const message = await Message.findById(messageId);
    const existingReaction = message.reactions.find(r => r.user.toString() === userId);
    
    if (existingReaction) {
      existingReaction.emoji = emoji;
    } else {
      message.reactions.push({ user: userId, emoji });
    }
    
    await message.save();
    res.json({ message: 'Reaction added' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete message
router.delete('/messages/:messageId', async (req, res) => {
  try {
    const { deleteFor } = req.body; // 'me' or 'all'
    const messageId = req.params.messageId;
    const userId = req.session.userId;
    
    if (deleteFor === 'all') {
      await Message.findByIdAndUpdate(messageId, { deletedForAll: true });
    } else {
      await Message.findByIdAndUpdate(messageId, {
        $push: { deletedFor: { user: userId } }
      });
    }
    
    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;