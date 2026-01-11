const express = require("express");
const router = express.Router();
const {
  createSubscription,
  getSubscriptions,
  updateSubscription,
  deleteSubscription,
} = require("../controllers/subscriptionController");
const {
  createSubscriptionSchema,
} = require("../validators/subscriptionValidators");
const validateSubscriptionRequest = require("../middlewares/validateSubscriptionRequest");

router.post(
  "/",
  validateSubscriptionRequest(createSubscriptionSchema),
  createSubscription
);
router.get("/", getSubscriptions);
router.put("/:id", updateSubscription);
router.delete("/:id", deleteSubscription);

module.exports = router;
