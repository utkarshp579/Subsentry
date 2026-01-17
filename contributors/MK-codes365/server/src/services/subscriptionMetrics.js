// Helper to normalize prices to monthly
const getMonthlyAmount = (sub) => {
  if (!sub || !sub.price || isNaN(sub.price)) return 0;
  if (sub.active === false) return 0;

  switch (sub.billingCycle) {
    case 'monthly': return sub.price;
    case 'yearly': return sub.price / 12;
    case 'weekly': return (sub.price * 52) / 12;
    default: return 0;
  }
};

// Normalize to yearly
const getYearlyAmount = (sub) => getMonthlyAmount(sub) * 12;

// Sum up all active subs to get the monthly burn
const calculateMonthlySpend = (subs) => {
  if (!Array.isArray(subs) || subs.length === 0) return 0;
  const total = subs.reduce((acc, s) => acc + getMonthlyAmount(s), 0);
  return parseFloat(total.toFixed(2));
};

// Sum up for the yearly total
const calculateYearlySpend = (subs) => {
  if (!Array.isArray(subs) || subs.length === 0) return 0;
  const total = subs.reduce((acc, s) => acc + getYearlyAmount(s), 0);
  return parseFloat(total.toFixed(2));
};

module.exports = {
  getMonthlyAmount,
  getYearlyAmount,
  calculateMonthlySpend,
  calculateYearlySpend
};
