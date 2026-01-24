const { google } = require('googleapis');
const { encrypt } = require('../utils/encryption');
const GmailToken = require('../models/GmailToken');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// START OAUTH
exports.startOAuth = async (req, res) => {
  const clerkUserId = req.auth.userId;

  const state = Buffer.from(
    JSON.stringify({ clerkUserId })
  ).toString('base64');

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'select_account consent',
    include_granted_scopes: false,
    scope: ['https://www.googleapis.com/auth/gmail.readonly'],
    state,
  });

  res.redirect(url);
};

// CALLBACK
exports.oauthCallback = async (req, res) => {
  const { code, state } = req.query;
  const { clerkUserId } = JSON.parse(
    Buffer.from(state, 'base64').toString()
  );

  const { tokens } = await oauth2Client.getToken(code);

  const encrypted = encrypt(JSON.stringify(tokens));

  await GmailToken.findOneAndUpdate(
    { clerkUserId },
    {
      tokens: encrypted,
      connectedAt: new Date(),
    },
    { upsert: true }
  );

  res.redirect(
    `${process.env.FRONTEND_URL}/dashboard/settings?gmail_status=connected`
  );
};
