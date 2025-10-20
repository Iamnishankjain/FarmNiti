const validateMission = (req, res, next) => {
  const { title, description, category, difficulty, rewards } = req.body;

  if (!title || !title.en || !title.hi) {
    return res.status(400).json({
      success: false,
      message: 'Title in both English and Hindi is required'
    });
  }

  if (!description || !description.en || !description.hi) {
    return res.status(400).json({
      success: false,
      message: 'Description in both English and Hindi is required'
    });
  }

  if (!category) {
    return res.status(400).json({
      success: false,
      message: 'Category is required'
    });
  }

  if (!difficulty) {
    return res.status(400).json({
      success: false,
      message: 'Difficulty is required'
    });
  }

  if (!rewards || !rewards.xp || !rewards.greenCoins) {
    return res.status(400).json({
      success: false,
      message: 'Rewards (XP and Green Coins) are required'
    });
  }

  next();
};

const validateReward = (req, res, next) => {
  const { title, description, type, cost } = req.body;

  if (!title || !title.en || !title.hi) {
    return res.status(400).json({
      success: false,
      message: 'Title in both English and Hindi is required'
    });
  }

  if (!description || !description.en || !description.hi) {
    return res.status(400).json({
      success: false,
      message: 'Description in both English and Hindi is required'
    });
  }

  if (!type) {
    return res.status(400).json({
      success: false,
      message: 'Reward type is required'
    });
  }

  if (!cost || cost < 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid cost is required'
    });
  }

  next();
};

module.exports = { validateMission, validateReward };
