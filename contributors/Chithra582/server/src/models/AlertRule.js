const mongoose = require('mongoose');

const alertRuleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  daysBefore: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 5, 7, 14, 30], // Common reminder intervals
    default: 7
  },
  channels: {
    type: [{
      type: String,
      enum: ['email', 'in-app', 'push', 'sms']
    }],
    default: ['email', 'in-app'],
    validate: {
      validator: function(v) {
        return v.length > 0 && v.length <= 4;
      },
      message: 'At least one channel must be selected (max 4)'
    }
  },
  enabled: {
    type: Boolean,
    default: true
  },
  notificationTime: {
    type: String,
    default: '09:00',
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure one rule per user per daysBefore value
alertRuleSchema.index({ userId: 1, daysBefore: 1 }, { unique: true });

// Update timestamp before saving
alertRuleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('AlertRule', alertRuleSchema);