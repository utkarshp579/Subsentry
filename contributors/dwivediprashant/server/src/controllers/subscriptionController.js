const Subscription = require("../models/Subscription");
const { generateUserId } = require("../utils/userIdGenerate");
///////////-1)--create subscription---///////////

const createSubscription = async (req, res) => {
  try {
    const { userId, name, amount, billingCycle, renewalDate, isTrial, source } =
      req.body;
    // const userId = generateUserId();
    if (!userId || !name || !amount || !billingCycle || !renewalDate) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: name, amount, billingCycle, renewalDate",
      });
    }

    const subscription = new Subscription({
      userId,
      name,
      amount,
      billingCycle,
      renewalDate: new Date(renewalDate),
      isTrial: isTrial || false,
      source: source || "manual",
    });

    await subscription.save();

    res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      data: subscription,
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

///////////-2)--fetch subscription from database---///////////

const getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Subscriptions retrieved successfully",
      data: subscriptions,
      count: subscriptions.length,
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  createSubscription,
  getSubscriptions,
};
