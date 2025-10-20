const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Mission = require('../models/Mission');
const User = require('../models/User');

// @desc    Get all missions
// @route   GET /api/missions
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { season, category, difficulty } = req.query;
    let query = { isActive: true };
    
    if (season) query.season = season;
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    
    const missions = await Mission.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: missions.length,
      missions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get single mission
// @route   GET /api/missions/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    
    if (!mission) {
      return res.status(404).json({ success: false, message: 'Mission not found' });
    }
    
    res.json({ success: true, mission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create mission
// @route   POST /api/missions
// @access  Private (Authority only)
router.post('/', protect, authorize('authority'), async (req, res) => {
  try {
    const mission = await Mission.create({
      ...req.body,
      createdBy: req.user.id
    });
    
    res.status(201).json({ success: true, mission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update mission
// @route   PUT /api/missions/:id
// @access  Private (Authority only)
router.put('/:id', protect, authorize('authority'), async (req, res) => {
  try {
    const mission = await Mission.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!mission) {
      return res.status(404).json({ success: false, message: 'Mission not found' });
    }
    
    res.json({ success: true, mission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Start mission
// @route   POST /api/missions/:id/start
// @access  Private (Farmer only)
router.post('/:id/start', protect, authorize('farmer'), async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    const user = await User.findById(req.user.id);
    
    if (!mission) {
      return res.status(404).json({ success: false, message: 'Mission not found' });
    }
    
    // Check if already started
    const alreadyStarted = mission.participants.some(
      p => p.user.toString() === req.user.id && p.status === 'active'
    );
    
    if (alreadyStarted) {
      return res.status(400).json({ success: false, message: 'Mission already started' });
    }
    
    // Add user to participants
    mission.participants.push({
      user: req.user.id,
      startedAt: Date.now(),
      status: 'active'
    });
    
    // Add to user's active missions
    user.activeMissions.push({
      mission: mission._id,
      startedAt: Date.now()
    });
    
    await mission.save();
    await user.save();
    
    res.json({ success: true, message: 'Mission started', mission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Complete mission
// @route   POST /api/missions/:id/complete
// @access  Private (Farmer only)
router.post('/:id/complete', protect, authorize('farmer'), async (req, res) => {
  try {
    const { proofUrl, proofType, description } = req.body;
    const mission = await Mission.findById(req.params.id);
    const user = await User.findById(req.user.id);
    
    if (!mission) {
      return res.status(404).json({ success: false, message: 'Mission not found' });
    }
    
    // Find participant entry
    const participantIndex = mission.participants.findIndex(
      p => p.user.toString() === req.user.id && p.status === 'active'
    );
    
    if (participantIndex === -1) {
      return res.status(400).json({ success: false, message: 'Mission not started' });
    }
    
    // Update participant status
    mission.participants[participantIndex].status = 'completed';
    mission.participants[participantIndex].completedAt = Date.now();
    mission.participants[participantIndex].proof = {
      type: proofType,
      url: proofUrl,
      description
    };
    
    // Remove from active missions
    user.activeMissions = user.activeMissions.filter(
      m => m.mission.toString() !== mission._id.toString()
    );
    
    // Add to completed missions
    user.completedMissions.push(mission._id);
    
    // Award rewards
    user.addXP(mission.rewards.xp);
    user.greenCoins += mission.rewards.greenCoins;
    
    // Award badge if applicable
    if (mission.rewards.badge) {
      user.badges.push({
        name: mission.rewards.badge,
        icon: '🏆',
        earnedAt: Date.now()
      });
    }
    
    await mission.save();
    await user.save();
    
    res.json({
      success: true,
      message: 'Mission completed!',
      rewards: mission.rewards,
      user: {
        xp: user.xp,
        level: user.level,
        greenCoins: user.greenCoins
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
