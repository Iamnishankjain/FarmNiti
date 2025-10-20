const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Mission = require('../models/Mission');
const Post = require('../models/Post');
const Reward = require('../models/Reward');

// @desc    Get dashboard statistics
// @route   GET /api/analytics/dashboard
// @access  Private (Authority only)
router.get('/dashboard', protect, authorize('authority'), async (req, res) => {
  try {
    // Total counts
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    const totalMissions = await Mission.countDocuments();
    const activeMissions = await Mission.countDocuments({ isActive: true });
    const totalPosts = await Post.countDocuments();
    
    // Calculate completion rate
    const missions = await Mission.find();
    let totalParticipants = 0;
    let totalCompleted = 0;
    
    missions.forEach(mission => {
      totalParticipants += mission.participants.length;
      totalCompleted += mission.participants.filter(p => p.status === 'completed').length;
    });
    
    const completionRate = totalParticipants > 0 
      ? ((totalCompleted / totalParticipants) * 100).toFixed(2) 
      : 0;
    
    // Top farmers by XP
    const topFarmers = await User.find({ role: 'farmer' })
      .sort({ xp: -1 })
      .limit(5)
      .select('name xp level greenCoins village');
    
    // Recent activities
    const recentPosts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name village');
    
    // Green coins statistics
    const farmers = await User.find({ role: 'farmer' });
    const totalCoinsEarned = farmers.reduce((sum, farmer) => sum + farmer.greenCoins, 0);
    const avgCoinsPerFarmer = totalFarmers > 0 
      ? (totalCoinsEarned / totalFarmers).toFixed(2) 
      : 0;
    
    // Mission category distribution
    const categoryStats = await Mission.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    res.json({
      success: true,
      stats: {
        totalFarmers,
        totalMissions,
        activeMissions,
        totalPosts,
        completionRate: parseFloat(completionRate),
        totalCoinsEarned,
        avgCoinsPerFarmer: parseFloat(avgCoinsPerFarmer)
      },
      topFarmers,
      recentActivity: recentPosts,
      missionCategories: categoryStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get mission statistics
// @route   GET /api/analytics/missions
// @access  Private (Authority only)
router.get('/missions', protect, authorize('authority'), async (req, res) => {
  try {
    const missions = await Mission.find();
    
    const missionStats = missions.map(mission => {
      const totalParticipants = mission.participants.length;
      const completed = mission.participants.filter(p => p.status === 'completed').length;
      const active = mission.participants.filter(p => p.status === 'active').length;
      const completionRate = totalParticipants > 0 
        ? ((completed / totalParticipants) * 100).toFixed(2) 
        : 0;
      
      return {
        missionId: mission._id,
        title: mission.title,
        category: mission.category,
        difficulty: mission.difficulty,
        totalParticipants,
        completed,
        active,
        completionRate: parseFloat(completionRate),
        rewards: mission.rewards
      };
    });
    
    // Overall mission statistics
    const totalParticipations = missionStats.reduce((sum, m) => sum + m.totalParticipants, 0);
    const totalCompletions = missionStats.reduce((sum, m) => sum + m.completed, 0);
    const overallCompletionRate = totalParticipations > 0
      ? ((totalCompletions / totalParticipations) * 100).toFixed(2)
      : 0;
    
    // Category-wise statistics
    const categoryStats = {};
    missionStats.forEach(m => {
      if (!categoryStats[m.category]) {
        categoryStats[m.category] = {
          count: 0,
          participants: 0,
          completions: 0
        };
      }
      categoryStats[m.category].count++;
      categoryStats[m.category].participants += m.totalParticipants;
      categoryStats[m.category].completions += m.completed;
    });
    
    res.json({
      success: true,
      overall: {
        totalMissions: missions.length,
        totalParticipations,
        totalCompletions,
        completionRate: parseFloat(overallCompletionRate)
      },
      missions: missionStats,
      categoryBreakdown: categoryStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get region-wise statistics
// @route   GET /api/analytics/regions
// @access  Private (Authority only)
router.get('/regions', protect, authorize('authority'), async (req, res) => {
  try {
    // Aggregate farmers by state and district
    const stateStats = await User.aggregate([
      { $match: { role: 'farmer' } },
      {
        $group: {
          _id: '$state',
          farmers: { $sum: 1 },
          totalXP: { $sum: '$xp' },
          totalCoins: { $sum: '$greenCoins' },
          avgLevel: { $avg: '$level' },
          completedMissions: { $sum: { $size: '$completedMissions' } }
        }
      },
      { $sort: { farmers: -1 } }
    ]);
    
    const districtStats = await User.aggregate([
      { $match: { role: 'farmer' } },
      {
        $group: {
          _id: { state: '$state', district: '$district' },
          farmers: { $sum: 1 },
          totalXP: { $sum: '$xp' },
          totalCoins: { $sum: '$greenCoins' },
          avgLevel: { $avg: '$level' }
        }
      },
      { $sort: { farmers: -1 } },
      { $limit: 20 }
    ]);
    
    res.json({
      success: true,
      byState: stateStats,
      byDistrict: districtStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get user growth statistics
// @route   GET /api/analytics/user-growth
// @access  Private (Authority only)
router.get('/user-growth', protect, authorize('authority'), async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));
    
    // Get user registrations over time
    const userGrowth = await User.aggregate([
      {
        $match: {
          role: 'farmer',
          createdAt: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Calculate cumulative growth
    let cumulative = 0;
    const growthWithCumulative = userGrowth.map(item => {
      cumulative += item.count;
      return {
        date: item._id,
        newUsers: item.count,
        totalUsers: cumulative
      };
    });
    
    res.json({
      success: true,
      period: `${days} days`,
      data: growthWithCumulative
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get green coin usage statistics
// @route   GET /api/analytics/coin-usage
// @access  Private (Authority only)
router.get('/coin-usage', protect, authorize('authority'), async (req, res) => {
  try {
    // Total coins earned by farmers
    const farmers = await User.find({ role: 'farmer' });
    const totalCoinsInCirculation = farmers.reduce((sum, f) => sum + f.greenCoins, 0);
    
    // Coins spent on rewards
    const rewards = await Reward.find();
    let totalCoinsSpent = 0;
    
    rewards.forEach(reward => {
      totalCoinsSpent += reward.redemptions.length * reward.cost;
    });
    
    // Reward type distribution
    const rewardTypeStats = await Reward.aggregate([
      {
        $project: {
          type: 1,
          redemptionCount: { $size: '$redemptions' },
          cost: 1
        }
      },
      {
        $group: {
          _id: '$type',
          totalRedemptions: { $sum: '$redemptionCount' },
          avgCost: { $avg: '$cost' }
        }
      }
    ]);
    
    res.json({
      success: true,
      coinStats: {
        totalCoinsInCirculation,
        totalCoinsSpent,
        totalCoinsEarned: totalCoinsInCirculation + totalCoinsSpent,
        redemptionRate: totalCoinsSpent > 0 
          ? ((totalCoinsSpent / (totalCoinsInCirculation + totalCoinsSpent)) * 100).toFixed(2)
          : 0
      },
      rewardTypeBreakdown: rewardTypeStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Export analytics to CSV
// @route   GET /api/analytics/export/csv
// @access  Private (Authority only)
router.get('/export/csv', protect, authorize('authority'), async (req, res) => {
  try {
    const farmers = await User.find({ role: 'farmer' })
      .populate('completedMissions')
      .select('name email phone village district state xp level greenCoins completedMissions createdAt');
    
    // Generate CSV content
    let csvContent = 'Name,Email,Phone,Village,District,State,XP,Level,Green Coins,Completed Missions,Joined Date\n';
    
    farmers.forEach(farmer => {
      csvContent += `"${farmer.name}","${farmer.email}","${farmer.phone}","${farmer.village || ''}","${farmer.district || ''}","${farmer.state || ''}",${farmer.xp},${farmer.level},${farmer.greenCoins},${farmer.completedMissions.length},"${new Date(farmer.createdAt).toLocaleDateString()}"\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=farmniti-farmers-data.csv');
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Export mission analytics to CSV
// @route   GET /api/analytics/export/missions-csv
// @access  Private (Authority only)
router.get('/export/missions-csv', protect, authorize('authority'), async (req, res) => {
  try {
    const missions = await Mission.find();
    
    let csvContent = 'Mission Title (EN),Category,Difficulty,Season,Total Participants,Completed,Active,Completion Rate,XP Reward,Coin Reward,Created Date\n';
    
    missions.forEach(mission => {
      const totalParticipants = mission.participants.length;
      const completed = mission.participants.filter(p => p.status === 'completed').length;
      const active = mission.participants.filter(p => p.status === 'active').length;
      const completionRate = totalParticipants > 0 
        ? ((completed / totalParticipants) * 100).toFixed(2) 
        : 0;
      
      csvContent += `"${mission.title.en}","${mission.category}","${mission.difficulty}","${mission.season}",${totalParticipants},${completed},${active},${completionRate},${mission.rewards.xp},${mission.rewards.greenCoins},"${new Date(mission.createdAt).toLocaleDateString()}"\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=farmniti-missions-data.csv');
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get engagement statistics
// @route   GET /api/analytics/engagement
// @access  Private (Authority only)
router.get('/engagement', protect, authorize('authority'), async (req, res) => {
  try {
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    
    // Active users (completed at least one mission)
    const activeUsers = await User.countDocuments({
      role: 'farmer',
      'completedMissions.0': { $exists: true }
    });
    
    // Social engagement
    const totalPosts = await Post.countDocuments();
    const totalLikes = await Post.aggregate([
      { $project: { likesCount: { $size: '$likes' } } },
      { $group: { _id: null, total: { $sum: '$likesCount' } } }
    ]);
    
    const totalComments = await Post.aggregate([
      { $project: { commentsCount: { $size: '$comments' } } },
      { $group: { _id: null, total: { $sum: '$commentsCount' } } }
    ]);
    
    res.json({
      success: true,
      engagement: {
        totalFarmers,
        activeUsers,
        engagementRate: totalFarmers > 0 
          ? ((activeUsers / totalFarmers) * 100).toFixed(2) 
          : 0,
        socialActivity: {
          totalPosts,
          totalLikes: totalLikes[0]?.total || 0,
          totalComments: totalComments[0]?.total || 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
