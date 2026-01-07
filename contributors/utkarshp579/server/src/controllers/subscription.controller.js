import { Subscription } from "../models/Subscription.js";
import { validateCreateSubscription } from "../validators/subscription.validator.js";

export const createSubscription = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const error = validateCreateSubscription(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const subscription = new Subscription({
      ...req.body,
      userId,
    });

    const savedSubscription = await subscription.save();

    return res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      data: savedSubscription,
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getUserSubscriptions = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const subscriptions = await Subscription.find({ userId })
      .sort({ renewalDate: 1 })
      .select(
        "name amount currency billingCycle category renewalDate isTrial trialEndsAt source status createdAt updatedAt"
      )
      .lean();

    return res.status(200).json({
      success: true,
      message: "Subscriptions retrieved successfully",
      data: subscriptions,
      count: subscriptions.length,
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
