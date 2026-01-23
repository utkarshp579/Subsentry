export const BILLING_CYCLES = Object.freeze({
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  WEEKLY: 'weekly',
  CUSTOM: 'custom',
});

export const SUBSCRIPTION_SOURCES = Object.freeze({
  MANUAL: 'manual',
  GMAIL: 'gmail',
  IMPORTED: 'imported',
});

export const SUBSCRIPTION_STATUS = Object.freeze({
  ACTIVE: 'active',
  PAUSED: 'paused',
  CANCELLED: 'cancelled',
});

export const SUBSCRIPTION_CATEGORIES = Object.freeze({
  ENTERTAINMENT: 'entertainment',
  MUSIC: 'music',
  EDUCATION: 'education',
  PRODUCTIVITY: 'productivity',
  FINANCE: 'finance',
  HEALTH: 'health',
  OTHER: 'other',
});

export const DEFAULT_CURRENCY = 'USD';
