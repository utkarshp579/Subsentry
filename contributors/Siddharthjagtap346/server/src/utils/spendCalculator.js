import { BILLING_CYCLES } from '../constants/subscription.constants.js';

/**
 * Normalize a subscription amount to YEARLY value
 */
const toYearlyAmount = (subscription) => {
  const { amount, billingCycle, status } = subscription;

  if (status !== 'active' || !amount || isNaN(amount)) return 0;

  switch (billingCycle) {
    case BILLING_CYCLES.MONTHLY:
      return amount * 12;

    case BILLING_CYCLES.WEEKLY:
      return amount * 52;

    case BILLING_CYCLES.YEARLY:
      return amount;

    default:
      return 0;
  }
};

export const calculateYearlySpend = (subscriptions = []) => {
  return subscriptions.reduce(
    (total, sub) => total + toYearlyAmount(sub),
    0
  );
};

/**
 * Calculate total monthly spend
 * Reuses yearly normalization (NO duplicate math)
 */
export const calculateMonthlySpend = (subscriptions = []) => {
  return subscriptions.reduce(
    (total, sub) => total + toYearlyAmount(sub) / 12,
    0
  );
};
