const express = require("express");
const router = express.Router();
const {
  getAuthUrl,
  handleCallback,
  getStatus,
  getTransactionalEmails,
} = require("../controllers/gmailController");

router.get("/auth-url", getAuthUrl);
router.get("/callback", handleCallback);
router.get("/status", getStatus);
router.get("/transactional", getTransactionalEmails);

module.exports = router;
