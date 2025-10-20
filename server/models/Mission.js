const mongoose = require('mongoose');

const missionSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    hi: { type: String, required: true }
  },
  description: {
    en: { type: String, required: true },
    hi: { type: String, required: true }
  },
  category: {
    type: String,
    enum: ['soil', 'water', 'crops', 'organic', 'community', 'weather'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  season: {
    type: String,
    enum: ['kharif', 'rabi', 'zaid', 'all'],
    default: 'all'
  },
  crop: String,
  duration: {
    value: Number,
    unit: {
      type: String,
      enum: ['hours', 'days', 'weeks'],
      default: 'days'
    }
  },
  rewards: {
    xp: {
      type: Number,
      required: true
    },
    greenCoins: {
      type: Number,
      required: true
    },
    badge: String
  },
  requirements: {
    type: String
  },
  steps: [{
    en: String,
    hi: String
  }],
  weatherCondition: {
    temperature: { min: Number, max: Number },
    rainfall: { min: Number, max: Number },
    humidity: { min: Number, max: Number }
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/400x300?text=Mission'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    startedAt: Date,
    completedAt: Date,
    status: {
      type: String,
      enum: ['active', 'completed', 'failed'],
      default: 'active'
    },
    proof: {
      type: {
        type: String,
        enum: ['image', 'video']
      },
      url: String,
      description: String
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Mission', missionSchema);
