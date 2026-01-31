const express = require('express');
const router = express.Router();
const alertsController = require('../controllers/alertsController');
const { authenticate } = require('../middleware/auth');
const { validateAlertRule, validateUpcomingQuery } = require('../validators/alertRulesValidator');

// Apply authentication middleware to all routes
router.use(authenticate);

// Alert Rules Routes
router.post('/rules', validateAlertRule, alertsController.saveAlertRule);
router.get('/rules', alertsController.getAlertRules);
router.patch('/rules/:ruleId/toggle', alertsController.toggleAlertRule);
router.delete('/rules/:ruleId', alertsController.deleteAlertRule);

// Upcoming Renewals Routes
router.get('/upcoming', validateUpcomingQuery, alertsController.getUpcomingRenewals);
router.get('/upcoming/summary', validateUpcomingQuery, alertsController.getRenewalSummary);

module.exports = router;