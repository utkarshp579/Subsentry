const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true,
    length: 3
  },
  billingCycle: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom']
  },
  renewalDate: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    enum: ['entertainment', 'productivity', 'utilities', 'cloud', 'education', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'paused', 'expired'],
    default: 'active'
  },
  paymentMethod: {
    type: String,
    trim: true
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  website: {
    type: String,
    trim: true
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

// Index for efficient querying of upcoming renewals
subscriptionSchema.index({ userId: 1, renewalDate: 1, status: 1 });

// Update timestamp before saving
subscriptionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for checking if subscription is active
subscriptionSchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

module.exports = mongoose.model('Subscription', subscriptionSchema);