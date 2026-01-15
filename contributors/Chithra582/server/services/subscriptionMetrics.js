/**
 * Convert a subscription into its monthly amount
 */
function getMonthlyAmount(subscription) {
  if (!subscription) return 0;
  const { amount, billingCycle, status } = subscription;
  if (status !== "active") return 0;
  if (typeof amount !== "number" || isNaN(amount) || amount <= 0) return 0;
  if (billingCycle === "yearly") {
    return amount / 12;
  }
  if (billingCycle === "monthly") {
    return amount;
  }

  return 0;
}
function calculateMonthlySpend(subscriptions = []) {
  if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
    return 0;
  }
  const total = subscriptions.reduce((sum, sub) => {
    return sum + getMonthlyAmount(sub);
  }, 0);
  return Number(total.toFixed(2));
}
module.exports = {
  getMonthlyAmount,
  calculateMonthlySpend,
};
