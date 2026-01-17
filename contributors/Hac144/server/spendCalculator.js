// Helper functions
function getYearlyAmount(subscription) {
  if (subscription.billingCycle === "monthly") {
    return subscription.amount * 12;
  }
  if (subscription.billingCycle === "yearly") {
    return subscription.amount;
  }
  return 0;
}

function calculateYearlySpend(subscriptions) {
  return subscriptions.reduce((total, sub) => total + getYearlyAmount(sub), 0);
}


function getSubscriptions(req, res) {

  const subscriptions = [
    { name: "Spotify", amount: 119, billingCycle: "monthly" },
    { name: "Prime", amount: 1499, billingCycle: "yearly" }
  ];

  const monthlySpend = subscriptions.reduce((total, sub) => {
    return total + (sub.billingCycle === "monthly" ? sub.amount : 0);
  }, 0);

 
  const yearlySpend = calculateYearlySpend(subscriptions);
  res.json({
    data: subscriptions,
    meta: {
      monthlySpend,
      yearlySpend
    }
  });
}

module.exports = { getSubscriptions };
