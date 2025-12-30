import { Subscription } from "../src/models/Subscription";

// Create a new subscription (POST)
export const createSubscription = async (req, res, next) => {
  try {
    const { name, amount, billingCycle, renewalDate, isTrial, source } = req.body;
    const userId = req.user.id; 

    if (!name || !amount || !billingCycle || !renewalDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, amount, billingCycle, and renewalDate are required',
      });
    }

    
    if (!['monthly', 'yearly'].includes(billingCycle)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid billingCycle. Must be either "monthly" or "yearly"',
      });
    }

    
    if (source && !['manual', 'email'].includes(source)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid source. Must be either "manual" or "email"',
      });
    }

    
    if (typeof amount !== 'number' || amount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number',
      });
    }

    // Validate renewalDate
    const parsedDate = new Date(renewalDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid renewalDate format',
      });
    }

    // Create subscription object
    const subscriptionData = {
      userId,
      name,
      amount,
      billingCycle,
      renewalDate: parsedDate,
      isTrial: isTrial || false,
      source: source || 'manual',
    };

    const subscription = await Subscription.create(subscriptionData);

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

// Get all subscriptions for authenticated user (GET)
export const getSubscriptions = async (req, res, next) => {
  try {
    const userId = req.user.id; 

    
    const { billingCycle, isTrial, source } = req.query;

    
    const filter = { userId };

    if (billingCycle) {
      filter.billingCycle = billingCycle;
    }

    if (isTrial !== undefined) {
      filter.isTrial = isTrial === 'true';
    }

    if (source) {
      filter.source = source;
    }

    const subscriptions = await Subscription.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptions,
    });
  } catch (error) {
    next(error);
  }
};

// Get single subscription by ID (GET)
export const getSubscriptionById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const subscription = await Subscription.findOne({ _id: id, userId });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found or access denied',
      });
    }

    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};
