import Subscription from "../db/subscription.schema.js";

export async function isDuplicate({ userId, merchant, amount, billingDate }) {
  return await Subscription.exists({
    userId,
    merchant,
    amount,
    billingDate
  });
}
