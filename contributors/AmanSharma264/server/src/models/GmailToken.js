const mongoose = require('mongoose');

const GmailTokenSchema = new mongoose.Schema({
  clerkUserId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  tokens: {
    encrypted: String,
    iv: String,
    authTag: String,
  },
  connectedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('GmailToken', GmailTokenSchema);
