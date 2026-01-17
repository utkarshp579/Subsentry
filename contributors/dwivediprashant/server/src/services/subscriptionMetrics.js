const normalizeAmount = (subscription) => {
  if (!subscription || typeof subscription !== "object") {
    return null;
  }

  const numericAmount = Number(subscription.amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return 0;
  }

  return numericAmount;
};

const getMonthlyAmount = (subscription) => {
  const numericAmount = normalizeAmount(subscription);

  if (numericAmount === null) {
    return 0;
  }

  const normalizedCycle = String(subscription.billingCycle || "").toLowerCase();

  if (normalizedCycle === "yearly") {
    return numericAmount / 12;
  }

  if (normalizedCycle === "monthly") {
    return numericAmount;
  }

  return 0;
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
  if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
    return 0;
  }

  const total = subscriptions.reduce(
    (sum, subscription) => sum + getMonthlyAmount(subscription),
    0,
  );

  return Number(total.toFixed(2));
};

const calculateYearlySpend = (subscriptions = []) => {
  if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
    return 0;
  }

  const total = subscriptions.reduce(
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
