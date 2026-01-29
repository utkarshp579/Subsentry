import { AlertRule } from '../models/AlertRule.js';
import { Subscription } from '../models/Subscription.js';
import { SUBSCRIPTION_STATUS } from '../constants/subscription.constants.js';

/**
 * Get Alert Rules for the user (or default if not set)
 * GET /api/alerts/rules
 */
export const getRules = async (req, res) => {
    try {
        const userId = req.user.id;
        let rules = await AlertRule.findOne({ userId });

        if (!rules) {
            // Return defaults but don't save yet to keep DB clean until they customize
            return res.json({
                daysBefore: 3,
                channels: ['email'],
                enabled: true,
                isDefault: true
            });
        }

        res.json(rules);
    } catch (error) {
        console.error('Get Rules Error:', error);
        res.status(500).json({ message: 'Failed to fetch alert rules' });
    }
};

/**
 * Update Alert Rules
 * POST /api/alerts/rules
 */
export const updateRules = async (req, res) => {
    try {
        const userId = req.user.id;
        const { daysBefore, channels, enabled } = req.body;

        // Validation
        if (daysBefore && (daysBefore < 1 || daysBefore > 30)) {
            return res.status(400).json({ message: 'daysBefore must be between 1 and 30' });
        }

        const rules = await AlertRule.findOneAndUpdate(
            { userId },
            {
                $set: {
                    daysBefore: daysBefore || 3,
                    channels: channels || ['email'],
                    enabled: enabled !== undefined ? enabled : true
                }
            },
            { upsert: true, new: true }
        );

        res.json(rules);
    } catch (error) {
        console.error('Update Rules Error:', error);
        res.status(500).json({ message: 'Failed to update alert rules' });
    }
};

/**
 * Get Upcoming Renewals based on user's rules
 * GET /api/alerts/upcoming
 */
export const getUpcoming = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get Rules (or default)
        const rules = await AlertRule.findOne({ userId });

        // Default settings if no rules found
        const daysBefore = rules ? rules.daysBefore : 3;
        const isEnabled = rules ? rules.enabled : true;

        if (!isEnabled) {
            return res.json({
                windowDays: daysBefore,
                subscriptions: [],
                message: 'Alerts are disabled'
            });
        }

        // 2. Calculate Window
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today

        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + daysBefore);
        targetDate.setHours(23, 59, 59, 999); // End of target day

        // 3. Find Subscriptions
        const upcomingSubs = await Subscription.find({
            userId,
            status: { $in: [SUBSCRIPTION_STATUS.ACTIVE, SUBSCRIPTION_STATUS.PAUSED] }, // Include paused? Maybe they want to know before it resumes? Usually active. Let's keep Active only for now to be safe, or both. Let's stick to ACTIVE explicitly.
            renewalDate: {
                $gte: today,
                $lte: targetDate
            }
        }).sort({ renewalDate: 1 });

        res.json({
            windowDays: daysBefore,
            count: upcomingSubs.length,
            subscriptions: upcomingSubs
        });

    } catch (error) {
        console.error('Get Upcoming Error:', error);
        res.status(500).json({ message: 'Failed to fetch upcoming renewals' });
    }
};
