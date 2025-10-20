const Mission = require('../models/Mission');
const User = require('../models/User');

// @desc    Get all missions
// @route   GET /api/missions
// @access  Public
exports.getAllMissions = async (req, res) => {
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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single mission
// @route   GET /api/missions/:id
// @access  Public
exports.getMissionById = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    
    if (!mission) {
      return res.status(404).json({
        success: false,
        message: 'Mission not found'
      });
    }
    
    res.json({
      success: true,
      mission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create mission
// @route   POST /api/missions
// @access  Private (Authority only)
exports.createMission = async (req, res) => {
  try {
    const mission = await Mission.create({
      ...req.body,
      createdBy: req.user.id
    });
    
    res.status(201).json({
      success: true,
      mission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update mission
// @route   PUT /api/missions/:id
// @access  Private (Authority only)
exports.updateMission = async (req, res) => {
  try {
    const mission = await Mission.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!mission) {
      return res.status(404).json({
        success: false,
        message: 'Mission not found'
      });
    }
    
    res.json({
      success: true,
      mission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete mission
// @route   DELETE /api/missions/:id
// @access  Private (Authority only)
exports.deleteMission = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    
    if (!mission) {
      return res.status(404).json({
        success: false,
        message: 'Mission not found'
      });
    }
    
    mission.isActive = false;
    await mission.save();
    
    res.json({
      success: true,
      message: 'Mission deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
