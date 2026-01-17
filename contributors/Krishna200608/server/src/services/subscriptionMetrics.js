import { BILLING_CYCLES, SUBSCRIPTION_STATUS } from '../constants/subscription.constants.js';

// Convert a subscription into its yearly amount
export const getYearlyAmount = (subscription) => {
  if (!subscription) return 0;

  const { amount, billingCycle, status } = subscription;

  if (status !== SUBSCRIPTION_STATUS.ACTIVE) return 0;
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) return 0;

  switch (billingCycle) {
    case BILLING_CYCLES.MONTHLY:
      return amount * 12;

    case BILLING_CYCLES.YEARLY:
      return amount;

    default:
      return 0;
  }
};

// Calculate total yearly spend
export const calculateYearlySpend = (subscriptions = []) => {
  const total = subscriptions.reduce((sum, sub) => {
    return sum + getYearlyAmount(sub);
  }, 0);

  return Math.round(total * 100) / 100;
};


//Convert a subscription into its monthly amount
export const getMonthlyAmount = (subscription) => {
  if (!subscription) return 0;

  const { amount, billingCycle, status } = subscription;

  // Ignore inactive or invalid subscriptions
  if (status !== SUBSCRIPTION_STATUS.ACTIVE) return 0;
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) return 0;

  switch (billingCycle) {
    case BILLING_CYCLES.MONTHLY:
      return amount;

    case BILLING_CYCLES.YEARLY:
      return amount / 12;

    default:
      // Ignore weekly, custom, or unsupported cycles
      return 0;
  }
};

// Calculate total effective monthly spend
export const calculateMonthlySpend = (subscriptions = []) => {
  const total = subscriptions.reduce((sum, sub) => {
    return sum + getMonthlyAmount(sub);
  }, 0);

  // Round to 2 decimal places
  return Math.round(total * 100) / 100;
};
