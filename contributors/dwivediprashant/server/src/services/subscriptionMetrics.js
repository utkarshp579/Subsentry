const getMonthlyAmount = (subscription) => {
  if (!subscription || typeof subscription !== "object") {
    return 0;
  }

  const { amount, billingCycle, status } = subscription;

  if (status && String(status).toLowerCase() !== "active") {
    return 0;
const normalizeAmount = (subscription) => {
  if (!subscription || typeof subscription !== "object") {
    return null;
  }

  const { amount, status } = subscription;

  if (status && String(status).toLowerCase() !== "active") {
    return null;
  }

  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return 0;
  }

  const normalizedCycle = String(billingCycle || "").toLowerCase();

  if (normalizedCycle === "yearly") {
    return numericAmount / 12;
  }

  if (normalizedCycle === "monthly") {
    return null;
  }

  return numericAmount;
};

const getYearlyAmount = (subscription) => {
  const numericAmount = normalizeAmount(subscription);

  if (numericAmount === null) {
    return 0;
  }

  const normalizedCycle = String(subscription.billingCycle || "").toLowerCase();

  if (normalizedCycle === "monthly") {
    return numericAmount * 12;
  }

  if (normalizedCycle === "yearly") {
    return numericAmount;
  }

  return 0;
};

const calculateMonthlySpend = (subscriptions = []) => {
const calculateYearlySpend = (subscriptions = []) => {
  if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
    return 0;
  }

  const total = subscriptions.reduce(
    (sum, subscription) => sum + getMonthlyAmount(subscription),
    (sum, subscription) => sum + getYearlyAmount(subscription),
    0,
  );

  return Number(total.toFixed(2));
};

module.exports = {
  getMonthlyAmount,
  calculateMonthlySpend,
  getYearlyAmount,
  calculateYearlySpend,
};
