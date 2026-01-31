const Subscription = require("../models/subscription");
const mongoose = require("mongoose");

/**
 * GET /api/analytics/overview
 * Returns dashboard analytics overview
 */
async function getAnalyticsOverview(req, res) {
  try {
    const now = new Date();
    const utcNow = new Date(now.toISOString().slice(0, 19) + "Z");
    const startOfMonth = new Date(
      Date.UTC(utcNow.getUTCFullYear(), utcNow.getUTCMonth(), 1),
    );
    const startOfYear = new Date(Date.UTC(utcNow.getUTCFullYear(), 0, 1));
    const sixMonthsAgo = new Date(
      Date.UTC(utcNow.getUTCFullYear(), utcNow.getUTCMonth() - 5, 1),
    );
    const twelveMonthsAgo = new Date(
      Date.UTC(utcNow.getUTCFullYear(), utcNow.getUTCMonth() - 11, 1),
    );
    const endOfToday = new Date(
      Date.UTC(
        utcNow.getUTCFullYear(),
        utcNow.getUTCMonth(),
        utcNow.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    );

    // 1. Monthly Spend (current month)
    // 2. Yearly Spend (last 12 months)
    // 3. activeCount, trialCount, urgentRenewals
    // 4. Category spend breakdown (top 5)
    // 5. Trend series for last 6 months

    // Aggregation pipeline
    const pipeline = [
      {
        $facet: {
          monthlySpend: [
            {
              $match: { renewalDate: { $gte: startOfMonth, $lte: endOfToday } },
            },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ],
          yearlySpend: [
            {
              $match: {
                renewalDate: { $gte: twelveMonthsAgo, $lte: endOfToday },
              },
            },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ],
          activeCount: [
            { $match: { renewalDate: { $gte: now } } },
            { $count: "count" },
          ],
          trialCount: [
            { $match: { isTrial: true, renewalDate: { $gte: now } } },
            { $count: "count" },
          ],
          urgentRenewals: [
            {
              $match: {
                renewalDate: {
                  $gte: now,
                  $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
                },
              },
            },
            { $count: "count" },
          ],
          categoryBreakdown: [
            {
              $match: {
                renewalDate: { $gte: twelveMonthsAgo, $lte: endOfToday },
              },
            },
            { $group: { _id: "$category", total: { $sum: "$amount" } } },
            { $sort: { total: -1 } },
            { $limit: 5 },
          ],
          trendSeries: [
            {
              $match: { renewalDate: { $gte: sixMonthsAgo, $lte: endOfToday } },
            },
            {
              $group: {
                _id: {
                  year: { $year: "$renewalDate" },
                  month: { $month: "$renewalDate" },
                },
                amount: { $sum: "$amount" },
              },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
          ],
        },
      },
    ];

    const [result] = await Subscription.aggregate(pipeline);

    // Format trend series
    const trendSeries = (result.trendSeries || []).map((item) => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
      amount: item.amount,
    }));

    // Format category breakdown
    const categoryBreakdown = (result.categoryBreakdown || []).map((item) => ({
      category: item._id,
      amount: item.total,
    }));

    res.json({
      monthlySpend: result.monthlySpend[0]?.total || 0,
      yearlySpend: result.yearlySpend[0]?.total || 0,
      activeCount: result.activeCount[0]?.count || 0,
      trialCount: result.trialCount[0]?.count || 0,
      urgentRenewals: result.urgentRenewals[0]?.count || 0,
      categoryBreakdown,
      trendSeries,
      timezone: "UTC",
    });
  } catch (err) {
    console.error("Analytics overview error:", err);
    res.status(500).json({ error: "Failed to compute analytics overview" });
  }
}

module.exports = { getAnalyticsOverview };
