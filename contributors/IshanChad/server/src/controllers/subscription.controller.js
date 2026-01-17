import { Subscription } from '../models/Subscription.js';
import { validateCreateSubscription } from '../validators/subscription.validator.js';

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

    return res.status(200).json({ subscriptions });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch subscriptions',
      error: error.message,
    });
  }
};
