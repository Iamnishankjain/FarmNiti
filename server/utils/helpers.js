// Calculate XP needed for next level
exports.calculateXPForLevel = (level) => {
  return level * 100;
};

// Check if user has leveled up
exports.checkLevelUp = (currentXP) => {
  const newLevel = Math.floor(currentXP / 100) + 1;
  return newLevel;
};

// Format date for responses
exports.formatDate = (date) => {
  return new Date(date).toISOString();
};

// Generate random string
exports.generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Paginate results
exports.paginateResults = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return { skip, limit: parseInt(limit) };
};

// Validate email
exports.isValidEmail = (email) => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email);
};

// Sanitize user data for response
exports.sanitizeUser = (user) => {
  const userObject = user.toObject();
  delete userObject.password;
  return userObject;
};
