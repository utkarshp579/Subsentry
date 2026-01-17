const { calculateMonthlySpend, calculateYearlySpend } = require('./subscriptionMetrics');

const testSubs = [
  { name: 'Netflix', price: 499, billingCycle: 'monthly', active: true },
  { name: 'Adobe', price: 12000, billingCycle: 'yearly', active: true },
  { name: 'Gym', price: 50, billingCycle: 'weekly', active: true },
  { name: 'Inactive', price: 100, billingCycle: 'monthly', active: false },
  { name: 'Invalid', price: NaN, billingCycle: 'monthly', active: true },
];

console.log('--- SubSentry Metrics Test (Monthly & Yearly) ---');

const monthly = calculateMonthlySpend(testSubs);
const yearly = calculateYearlySpend(testSubs);

console.log(`Monthly: ${monthly}`);
console.log(`Yearly: ${yearly}`);

// Math check:
// Netflix: 499/mo -> 5988/yr
// Adobe: 1000/mo -> 12000/yr
// Gym: 216.666.../mo -> 2600/yr
// Total Monthly: ~1715.67
// Total Yearly: 5988 + 12000 + 2600 = 20588

if (monthly === 1715.67 && yearly === 20588) {
  console.log('✅ ALL TESTS PASSED');
} else {
  console.log('❌ TEST FAILED');
  if (monthly !== 1715.67) console.log(`Monthly mismatch: expected 1715.67, got ${monthly}`);
  if (yearly !== 20588) console.log(`Yearly mismatch: expected 20588, got ${yearly}`);
}
