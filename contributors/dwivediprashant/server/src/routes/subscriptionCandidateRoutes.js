const express = require("express");
const router = express.Router();
const {
  processSubscriptionCandidates,
  getCandidates,
  getCandidateById,
  updateCandidateStatus,
  deleteCandidate,
  getStats,
  cleanupOldCandidates,
} = require("../controllers/subscriptionCandidateController");

// Process emails and create subscription candidates
router.post("/process", processSubscriptionCandidates);

// Get subscription candidates with filtering and pagination
router.get("/", getCandidates);

// Get statistics about subscription candidates
router.get("/stats", getStats);

// Cleanup old rejected candidates
router.delete("/cleanup", cleanupOldCandidates);

// Get a specific subscription candidate by ID
router.get("/:id", getCandidateById);

// Update subscription candidate status
router.patch("/:id/status", updateCandidateStatus);

// Delete a subscription candidate
router.delete("/:id", deleteCandidate);

module.exports = router;
