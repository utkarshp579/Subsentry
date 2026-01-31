const express = require("express");
const router = express.Router();
const { getAnalyticsOverview } = require("../controllers/analyticsController");

// GET /api/analytics/overview
router.get("/overview", getAnalyticsOverview);

module.exports = router;
