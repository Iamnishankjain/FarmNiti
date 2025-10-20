const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('completedMissions')
      .populate('activeMissions.mission');
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, village, district, state, preferredLanguage } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, village, district, state, preferredLanguage },
      { new: true, runValidators: true }
    );
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const { period = 'allTime' } = req.query;
    
    // Get top 100 farmers by XP
    const farmers = await User.find({ role: 'farmer' })
      .sort({ xp: -1 })
      .limit(100)
      .select('name village district state xp level greenCoins badges avatar');
    
    res.json({
      success: true,
      period,
      farmers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all farmers (for authority)
// @route   GET /api/users/farmers
// @access  Private (Authority only)
router.get('/farmers', protect, async (req, res) => {
  try {
    const farmers = await User.find({ role: 'farmer' })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: farmers.length,
      farmers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
