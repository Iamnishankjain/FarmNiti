const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Reward = require('../models/Reward');
const User = require('../models/User');

// @desc    Get all rewards
// @route   GET /api/rewards
// @access  Public
router.get('/', async (req, res) => {
  try {
    const rewards = await Reward.find({ isActive: true }).sort({ cost: 1 });
    
    res.json({
      success: true,
      count: rewards.length,
      rewards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get single reward
// @route   GET /api/rewards/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.id);
    
    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }
    
    res.json({
      success: true,
      reward
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Create reward
// @route   POST /api/rewards
// @access  Private (Authority only)
router.post('/', protect, authorize('authority'), async (req, res) => {
  try {
    const reward = await Reward.create(req.body);
    
    res.status(201).json({
      success: true,
      reward
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Update reward
// @route   PUT /api/rewards/:id
// @access  Private (Authority only)
router.put('/:id', protect, authorize('authority'), async (req, res) => {
  try {
    const reward = await Reward.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }
    
    res.json({
      success: true,
      reward
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Delete reward
// @route   DELETE /api/rewards/:id
// @access  Private (Authority only)
router.delete('/:id', protect, authorize('authority'), async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.id);
    
    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }
    
    // Soft delete - just mark as inactive
    reward.isActive = false;
    await reward.save();
    
    res.json({
      success: true,
      message: 'Reward deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Redeem reward
// @route   POST /api/rewards/:id/redeem
// @access  Private (Farmer only)
router.post('/:id/redeem', protect, authorize('farmer'), async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.id);
    const user = await User.findById(req.user.id);
    
    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }
    
    if (!reward.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Reward is no longer available'
      });
    }
    
    // Check if user has enough coins
    if (user.greenCoins < reward.cost) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient Green Coins',
        required: reward.cost,
        available: user.greenCoins
      });
    }
    
    // Check stock availability
    if (reward.stock !== -1 && reward.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Reward out of stock'
      });
    }
    
    // Deduct coins from user
    user.greenCoins -= reward.cost;
    
    // Add redemption record
    reward.redemptions.push({
      user: req.user.id,
      redeemedAt: Date.now(),
      status: 'pending'
    });
    
    // Decrease stock if not unlimited
    if (reward.stock !== -1) {
      reward.stock -= 1;
    }
    
    await user.save();
    await reward.save();
    
    res.json({
      success: true,
      message: 'Reward redeemed successfully!',
      remainingCoins: user.greenCoins,
      reward: {
        title: reward.title,
        type: reward.type
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get user's redeemed rewards
// @route   GET /api/rewards/user
// @access  Private (Farmer only)
router.get('/user/redeemed', protect, authorize('farmer'), async (req, res) => {
  try {
    const rewards = await Reward.find({
      'redemptions.user': req.user.id
    }).select('title description type cost image redemptions');
    
    // Filter to only show this user's redemptions
    const userRewards = rewards.map(reward => {
      const userRedemptions = reward.redemptions.filter(
        r => r.user.toString() === req.user.id
      );
      
      return {
        ...reward.toObject(),
        redemptions: userRedemptions
      };
    });
    
    res.json({
      success: true,
      count: userRewards.length,
      rewards: userRewards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get all redemptions (for authority)
// @route   GET /api/rewards/redemptions/all
// @access  Private (Authority only)
router.get('/redemptions/all', protect, authorize('authority'), async (req, res) => {
  try {
    const rewards = await Reward.find({ 'redemptions.0': { $exists: true } })
      .populate('redemptions.user', 'name email phone village district state');
    
    // Flatten redemptions for easier management
    const allRedemptions = [];
    rewards.forEach(reward => {
      reward.redemptions.forEach(redemption => {
        allRedemptions.push({
          redemptionId: redemption._id,
          rewardTitle: reward.title,
          rewardType: reward.type,
          user: redemption.user,
          redeemedAt: redemption.redeemedAt,
          status: redemption.status
        });
      });
    });
    
    res.json({
      success: true,
      count: allRedemptions.length,
      redemptions: allRedemptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Update redemption status
// @route   PUT /api/rewards/redemptions/:rewardId/:redemptionId
// @access  Private (Authority only)
router.put('/redemptions/:rewardId/:redemptionId', protect, authorize('authority'), async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const reward = await Reward.findById(req.params.rewardId);
    
    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }
    
    const redemption = reward.redemptions.id(req.params.redemptionId);
    
    if (!redemption) {
      return res.status(404).json({
        success: false,
        message: 'Redemption not found'
      });
    }
    
    redemption.status = status;
    await reward.save();
    
    res.json({
      success: true,
      message: 'Redemption status updated',
      redemption
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
