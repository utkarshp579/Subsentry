import { Subscription } from '../models/Subscription.js';
import { validateCreateSubscription } from '../validators/subscription.validator.js';
import { calculateMonthlySpend, calculateYearlySpend } from '../services/subscriptionMetrics.js';
import { SUBSCRIPTION_SOURCES, BILLING_CYCLES } from '../constants/subscription.constants.js';

export const createSubscription = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const error = validateCreateSubscription(req.body);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const subscription = new Subscription({
      ...req.body,
      userId,
    });

    const savedSubscription = await subscription.save();

    return res.status(201).json({
      message: 'Subscription created successfully',
      subscription: savedSubscription,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to create subscription',
      error: error.message,
    });
  }
};

export const getUserSubscriptions = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const subscriptions = await Subscription.find({ userId })
      .sort({ renewalDate: 1 })
      .select('-__v');

    const monthlySpend = calculateMonthlySpend(subscriptions);
    const yearlySpend = calculateYearlySpend(subscriptions);

    return res.status(200).json({
      data: subscriptions,
      meta: {
        monthlySpend,
        yearlySpend,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch subscriptions',
      error: error.message,
    });
  }
};

export const updateSubscription = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const subscription = await Subscription.findOne({ _id: id, userId });
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    const allowedUpdates = [
      'name',
      'amount',
      'currency',
      'billingCycle',
      'category',
      'renewalDate',
      'isTrial',
      'trialEndsAt',
      'source',
      'status',
      'notes',
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        subscription[field] = req.body[field];
      }
    });

    const updatedSubscription = await subscription.save();

    return res.status(200).json({
      message: 'Subscription updated successfully',
      subscription: updatedSubscription,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to update subscription',
      error: error.message,
    });
  }
};

export const deleteSubscription = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const subscription = await Subscription.findOneAndDelete({ _id: id, userId });
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    return res.status(200).json({
      message: 'Subscription deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to delete subscription',
      error: error.message,
    });
  }
};

export const importEmailSubscriptions = async (req, res) => {
  const userId = req.user?.id;
  const { parsed } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return res.status(200).json({
      message: 'Email subscriptions imported successfully',
      inserted: 0,
      skipped: 0,
    });
  }

  let inserted = 0;
  let skipped = 0;

  for (const item of parsed) {
    const { serviceName, billingHint, amount, timestamp } = item;

    // Required fields check
    if (!serviceName || !amount || !timestamp) {
      skipped++;
      continue;
    }

    const renewalDate = new Date(Number(timestamp));
    const billingCycle =
      billingHint === 'yearly'
        ? BILLING_CYCLES.YEARLY
        : BILLING_CYCLES.MONTHLY;

    // Deduplication check
    const exists = await Subscription.findOne({
      userId,
      name: serviceName.toLowerCase(),
      amount,
      renewalDate,
      source: SUBSCRIPTION_SOURCES.GMAIL,
    });

    if (exists) {
      skipped++;
      continue;
    }

    await Subscription.create({
      userId,
      name: serviceName.toLowerCase(),
      amount,
      billingCycle,
      renewalDate,
      source: SUBSCRIPTION_SOURCES.GMAIL,
    });

    inserted++;
  }

  return res.status(201).json({
    message: 'Email subscriptions imported successfully',
    inserted,
    skipped,
  });
};