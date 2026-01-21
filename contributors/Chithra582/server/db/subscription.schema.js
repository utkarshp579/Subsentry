import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,

  merchant: String,
  amount: Number,
  billingDate: Date,

  source: {
    type: String,
    default: "manual"
  }
});

export default mongoose.model("Subscription", SubscriptionSchema);
