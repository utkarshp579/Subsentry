const express = require("express");
const router = express.Router();
const {
  getAuthUrl,
  handleCallback,
  getStatus,
  getTransactionalEmails,
  getTransactionalEmailsWithCandidates,
} = require("../controllers/gmailController");

router.get("/auth-url", getAuthUrl);
router.get("/callback", handleCallback);
router.get("/status", getStatus);
router.get("/transactional", getTransactionalEmails);
router.get("/process-candidates", getTransactionalEmailsWithCandidates);

module.exports = router;
