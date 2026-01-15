const { calculateMonthlySpend } = require("../services/subscriptionMetrics");
exports.getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find();

    const monthlySpend = calculateMonthlySpend(subscriptions);

    res.status(200).json({
      data: subscriptions,
      meta: {
        monthlySpend,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch subscriptions" });
  }
};
