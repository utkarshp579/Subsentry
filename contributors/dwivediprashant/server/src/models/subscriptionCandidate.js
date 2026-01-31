const mongoose = require("mongoose");

const subscriptionCandidateSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: "default",
      index: true,
    },
    vendorKey: {
      type: String,
      required: true,
      index: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
      index: true,
    },
    signals: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    dedupeHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    emailData: {
      id: { type: String, required: true },
      threadId: { type: String, required: true },
      subject: { type: String, required: true },
      sender: { type: String, required: true },
      timestamp: { type: Number, required: true },
    },
    extractedData: {
      name: { type: String },
      amount: { type: Number },
      billingCycle: { type: String },
      renewalDate: { type: Date },
      currency: { type: String },
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "accepted", "rejected"],
      default: "pending",
      index: true,
    },
    vendorIcon: {
      type: String,
    },
    explainability: {
      topSignals: [{
        signal: { type: String, required: true },
        weight: { type: Number, required: true },
        description: { type: String, required: true },
      }],
      confidenceBreakdown: {
        domainMatch: { type: Number, default: 0 },
        subjectKeywords: { type: Number, default: 0 },
        recurringPattern: { type: Number, default: 0 },
        receiptPattern: { type: Number, default: 0 },
      },
    },
  },
  { timestamps: true }
);

const SubscriptionCandidate = mongoose.model("SubscriptionCandidate", subscriptionCandidateSchema);

module.exports = SubscriptionCandidate;
