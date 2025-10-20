const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  title: {
    en: String,
    hi: String
  },
  description: {
    en: String,
    hi: String
  },
  type: {
    type: String,
    enum: ['certificate', 'coupon', 'badge', 'physical'],
    required: true
  },
  cost: {
    type: Number,
    required: true
  },
  image: String,
  stock: {
    type: Number,
    default: -1 // -1 means unlimited
  },
  isActive: {
    type: Boolean,
    default: true
  },
  redemptions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    redeemedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'delivered', 'cancelled'],
      default: 'pending'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Reward', rewardSchema);
