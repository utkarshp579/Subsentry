const express = require('express');
const router = express.Router();
const clerkAuth = require('../middlewares/clerk.middleware');
const gmailAuth = require('../middlewares/gmailAuth');
const gmailController = require('../controllers/gmail.controller');

router.get('/auth', clerkAuth, gmailAuth.startOAuth);
router.get('/callback', gmailAuth.oauthCallback);
router.get('/emails', clerkAuth, gmailController.getEmails);

module.exports = router;
