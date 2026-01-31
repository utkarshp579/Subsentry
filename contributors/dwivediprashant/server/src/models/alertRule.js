const mongoose = require("mongoose");

const alertRuleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    daysBefore: {
      type: [Number],
      required: true,
      validate: (v) =>
        Array.isArray(v) && v.length > 0 && v.every((n) => n > 0),
    },
    channels: {
      type: [String],
      enum: ["email", "in-app"],
      default: ["in-app"],
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const AlertRule = mongoose.model("AlertRule", alertRuleSchema);

module.exports = AlertRule;
