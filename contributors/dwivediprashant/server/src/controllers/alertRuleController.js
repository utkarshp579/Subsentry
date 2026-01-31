const AlertRule = require("../models/alertRule");
const Subscription = require("../models/subscription");

// POST /api/alerts/rules
exports.saveRule = async (req, res) => {
  try {
    const userId = req.user._id;
    const { daysBefore, channels, enabled } = req.body;
    if (
      !Array.isArray(daysBefore) ||
      daysBefore.length === 0 ||
      !daysBefore.every((n) => typeof n === "number" && n > 0)
    ) {
      return res
        .status(400)
        .json({
          error: "daysBefore must be a non-empty array of positive numbers.",
        });
    }
    if (
      channels &&
      (!Array.isArray(channels) ||
        !channels.every((c) => ["email", "in-app"].includes(c)))
    ) {
      return res
        .status(400)
        .json({
          error:
            "channels must be an array containing 'email' and/or 'in-app'.",
        });
    }
    let rule = await AlertRule.findOne({ userId });
    if (rule) {
      rule.daysBefore = daysBefore;
      rule.channels = channels || rule.channels;
      rule.enabled = enabled !== undefined ? enabled : rule.enabled;
      await rule.save();
    } else {
      rule = await AlertRule.create({ userId, daysBefore, channels, enabled });
    }
    res.json({ success: true, rule });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to save alert rule.", details: err.message });
  }
};

// GET /api/alerts/rules
exports.getRule = async (req, res) => {
  try {
    const userId = req.user._id;
    const rule = await AlertRule.findOne({ userId });
    if (!rule)
      return res.status(404).json({ error: "No alert rule found for user." });
    res.json({ rule });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch alert rule.", details: err.message });
  }
};

// GET /api/alerts/upcoming
exports.getUpcoming = async (req, res) => {
  try {
    const userId = req.user._id;
    const rule = await AlertRule.findOne({ userId });
    if (!rule || !rule.enabled) return res.json({ upcoming: [] });
    const now = new Date();
    const maxDays = Math.max(...rule.daysBefore);
    const windowEnd = new Date(now.getTime() + maxDays * 24 * 60 * 60 * 1000);
    const subs = await Subscription.find({
      userId,
      renewalDate: { $gte: now, $lte: windowEnd },
    });
    // For each sub, find which daysBefore match
    const upcoming = subs
      .map((sub) => {
        const daysLeft = Math.ceil(
          (sub.renewalDate - now) / (1000 * 60 * 60 * 24),
        );
        const matched = rule.daysBefore.filter((d) => daysLeft === d);
        return matched.length > 0
          ? { ...sub.toObject(), daysLeft, alertDays: matched }
          : null;
      })
      .filter(Boolean);
    res.json({ upcoming });
  } catch (err) {
    res
      .status(500)
      .json({
        error: "Failed to fetch upcoming notifications.",
        details: err.message,
      });
  }
};
