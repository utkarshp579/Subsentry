import { BILLING_CYCLES } from '../constants/subscription.constants.js';

export const validateCreateSubscription = (data) => {
  const requiredFields = ['name', 'amount', 'billingCycle', 'renewalDate'];

  for (const field of requiredFields) {
    if (!data[field]) {
      return `Missing required field: ${field}`;
    }
  }

  if (typeof data.amount !== 'number' || data.amount < 0) {
    return 'Amount must be a non-negative number';
  }

  if (!Object.values(BILLING_CYCLES).includes(data.billingCycle)) {
    return 'Invalid billing cycle';
  }

  if (data.isTrial && !data.trialEndsAt) {
    return 'trialEndsAt is required when isTrial is true';
  }

  return null;
};
