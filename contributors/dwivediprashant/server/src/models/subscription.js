const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
    },
    renewalDate: {
      type: Date,
      required: true,
    },
    isTrial: {
      type: Boolean,
      default: false,
    },
    source: {
      type: String,
      enum: ["manual", "email"],
      default: "manual",
    },
    category: {
      type: String,
      required: true,
      enum: [
        "entertainment",
        "productivity",
        "utilities",
        "education",
        "health",
        "finance",
        "other",
      ],
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;
