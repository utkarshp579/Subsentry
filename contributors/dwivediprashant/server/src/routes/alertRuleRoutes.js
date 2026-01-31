const express = require("express");
const router = express.Router();
const alertRuleController = require("../controllers/alertRuleController");
const { requireAuth } = require("../middlewares/requireAuth");

// Save alert rule
router.post("/rules", requireAuth, alertRuleController.saveRule);
// Get alert rule
router.get("/rules", requireAuth, alertRuleController.getRule);
// Get upcoming notifications
router.get("/upcoming", requireAuth, alertRuleController.getUpcoming);

module.exports = router;
