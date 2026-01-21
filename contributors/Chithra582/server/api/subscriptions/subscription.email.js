import Subscription from "../../db/subscription.schema.js";
import { isDuplicate } from "../../helpers/subscriptionDedupe.js";

export async function saveFromEmail(userId, emailData) {
  if (!emailData?.merchant || !emailData?.billingDate) return;

  const duplicate = await isDuplicate({
    userId,
    merchant: emailData.merchant,
    amount: emailData.amount,
    billingDate: emailData.billingDate
  });

  if (duplicate) return;

  await Subscription.create({
    userId,
    merchant: emailData.merchant,
    amount: emailData.amount,
    billingDate: emailData.billingDate,
    source: "email"
  });
}
