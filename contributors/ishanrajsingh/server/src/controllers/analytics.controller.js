import { Subscription } from '../models/Subscription.js';
import { SUBSCRIPTION_STATUS } from '../constants/subscription.constants.js';

/**
 * Analytics Controller
 * Handles aggregation statistics for the dashboard
 */

export const getOverview = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // 1. Calculate Overview Stats (MRR, ARR, Counts)
        const statsPipeline = [
            {
                $match: {
                    userId: userId,
                    status: { $ne: SUBSCRIPTION_STATUS.CANCELLED } // Include ACTIVE and PAUSED
                }
            },
            {
                $group: {
                    _id: null,
                    totalMonthlySpend: {
                        $sum: {
                            $switch: {
                                branches: [
                                    { case: { $eq: ['$billingCycle', 'monthly'] }, then: '$amount' },
                                    { case: { $eq: ['$billingCycle', 'yearly'] }, then: { $divide: ['$amount', 12] } },
                                    { case: { $eq: ['$billingCycle', 'weekly'] }, then: { $multiply: ['$amount', 4] } }
                                ],
                                default: '$amount'
                            }
                        }
                    },
                    activeCount: {
                        $sum: { $cond: [{ $eq: ['$status', SUBSCRIPTION_STATUS.ACTIVE] }, 1, 0] }
                    },
                    trialCount: {
                        $sum: { $cond: ['$isTrial', 1, 0] }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    monthlySpend: { $round: ['$totalMonthlySpend', 2] },
                    yearlySpend: { $round: [{ $multiply: ['$totalMonthlySpend', 12] }, 2] },
                    activeCount: 1,
                    trialCount: 1
                }
            }
        ];

        // 2. Calculate Category Breakdown
        const categoryPipeline = [
            {
                $match: {
                    userId: userId,
                    status: { $in: [SUBSCRIPTION_STATUS.ACTIVE, SUBSCRIPTION_STATUS.PAUSED] }
                }
            },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    spend: {
                        $sum: {
                            $switch: {
                                branches: [
                                    { case: { $eq: ['$billingCycle', 'monthly'] }, then: '$amount' },
                                    { case: { $eq: ['$billingCycle', 'yearly'] }, then: { $divide: ['$amount', 12] } },
                                    { case: { $eq: ['$billingCycle', 'weekly'] }, then: { $multiply: ['$amount', 4] } }
                                ],
                                default: '$amount'
                            }
                        }
                    }
                }
            },
            { $sort: { spend: -1 } },
            { $limit: 5 },
            {
                $project: {
                    category: '$_id',
                    spend: { $round: ['$spend', 2] },
                    percentage: { $literal: 0 } // Will calc in JS to avoid complex aggregation math if total is 0
                }
            }
        ];

        // 3. Run Aggregations in Parallel
        const [statsResult, categoryResult, allActiveSubs] = await Promise.all([
            Subscription.aggregate(statsPipeline),
            Subscription.aggregate(categoryPipeline),
            // Fetch minimal fields for Trend Calculation (easier in JS than pure Mongo for sliding window on createdAt)
            Subscription.find(
                { userId, status: { $in: [SUBSCRIPTION_STATUS.ACTIVE, SUBSCRIPTION_STATUS.PAUSED] } },
                { amount: 1, billingCycle: 1, createdAt: 1 }
            ).lean()
        ]);

        const overview = statsResult[0] || {
            monthlySpend: 0,
            yearlySpend: 0,
            activeCount: 0,
            trialCount: 0
        };

        // Calculate Percentages for Categories
        const categories = categoryResult.map(cat => ({
            ...cat,
            percentage: overview.monthlySpend > 0
                ? Math.round((cat.spend / overview.monthlySpend) * 100)
                : 0
        }));

        // 4. Calculate Trend Series (Last 6 Months)
        // Assumption: We track spend of currently active subs based on when they were created.
        const trendSeries = [];
        const today = new Date();

        for (let i = 5; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = date.toLocaleString('default', { month: 'short' });

            // Calculate spend for this month based on subs that existed then
            const monthSpend = allActiveSubs.reduce((total, sub) => {
                if (new Date(sub.createdAt) <= new Date(today.getFullYear(), today.getMonth() - i + 1, 0)) {
                    // Normalize to monthly cost
                    let cost = sub.amount;
                    if (sub.billingCycle === 'yearly') cost /= 12;
                    if (sub.billingCycle === 'weekly') cost *= 4;
                    return total + cost;
                }
                return total;
            }, 0);

            trendSeries.push({
                month: monthName,
                amount: Math.round(monthSpend * 100) / 100
            });
        }

        res.status(200).json({
            overview,
            categories,
            trendSeries
        });

    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ message: 'Server error computing analytics' });
    }
};
