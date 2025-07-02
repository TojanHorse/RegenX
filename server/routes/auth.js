import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { email, username, password, securityQuestions } = req.body;
    
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const user = new User({
      email,
      username,
      password,
      securityQuestions
    });
    
    await user.save();
    
    req.session.userId = user._id;
    res.json({ message: 'User created successfully', user: { id: user._id, username: user.username, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    if (!user || user.password !== password) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    user.isOnline = true;
    await user.save();
    
    req.session.userId = user._id;
    res.json({ message: 'Login successful', user: { id: user._id, username: user.username, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { username, birthPlace, favoriteTeacher, newPassword } = req.body;
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.securityQuestions.birthPlace !== birthPlace || 
        user.securityQuestions.favoriteTeacher !== favoriteTeacher) {
      return res.status(400).json({ error: 'Security answers do not match' });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    if (req.session.userId) {
      await User.findByIdAndUpdate(req.session.userId, { 
        isOnline: false,
        lastSeen: new Date()
      });
    }
    
    req.session.destroy();
    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check auth status
router.get('/me', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const user = await User.findById(req.session.userId).select('-password -securityQuestions');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;