const GmailToken = require("../models/gmailToken");
const { getOAuth2Client, GMAIL_SCOPES } = require("../config/gmail");
const { encrypt, decrypt } = require("../utils/tokenCrypto");

const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";

const generateAuthUrl = (state) => {
  const oAuth2Client = getOAuth2Client();
  return oAuth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GMAIL_SCOPES,
    include_granted_scopes: true,
    state,
  });
};

const saveTokens = async (userId, tokens) => {
  if (!tokens || !tokens.access_token || !tokens.refresh_token) {
    throw new Error(
      "Missing access or refresh token. Ensure consent is granted with offline access.",
    );
  }

  const doc = {
    userId,
    accessTokenEncrypted: encrypt(tokens.access_token),
    refreshTokenEncrypted: encrypt(tokens.refresh_token),
    scope: tokens.scope || GMAIL_SCOPES.join(" "),
    tokenType: tokens.token_type || "Bearer",
    expiryDate: tokens.expiry_date || Date.now() + 3600 * 1000,
  };

  await GmailToken.findOneAndUpdate({ userId }, doc, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });
};

const getStoredTokens = async (userId) => {
  const record = await GmailToken.findOne({ userId });
  if (!record) {
    return null;
  }

  return {
    accessToken: decrypt(record.accessTokenEncrypted),
    refreshToken: decrypt(record.refreshTokenEncrypted),
    scope: record.scope,
    tokenType: record.tokenType,
    expiryDate: record.expiryDate,
  };
};

const exchangeCodeForTokens = async (code, userId) => {
  const oAuth2Client = getOAuth2Client();
  const { tokens } = await oAuth2Client.getToken(code);

  if (!tokens.scope || !tokens.scope.includes(GMAIL_SCOPE)) {
    throw new Error("Gmail read-only scope was not granted.");
  }

  await saveTokens(userId, tokens);

  return {
    scope: tokens.scope,
    expiryDate: tokens.expiry_date,
  };
};

const getAuthorizedClient = async (userId) => {
  const stored = await getStoredTokens(userId);
  if (!stored) {
    return null;
  }

  const oAuth2Client = getOAuth2Client();
  oAuth2Client.setCredentials({
    access_token: stored.accessToken,
    refresh_token: stored.refreshToken,
    scope: stored.scope,
    token_type: stored.tokenType,
    expiry_date: stored.expiryDate,
  });

  return oAuth2Client;
};

const refreshAccessTokenIfNeeded = async (userId) => {
  const oAuth2Client = await getAuthorizedClient(userId);
  if (!oAuth2Client) {
    return null;
  }

  const now = Date.now();
  const expiresAt = oAuth2Client.credentials.expiry_date || 0;

  if (expiresAt && expiresAt - now > 60 * 1000) {
    return {
      connected: true,
      scope: oAuth2Client.credentials.scope,
      expiryDate: expiresAt,
    };
  }

  await oAuth2Client.getAccessToken();

  const updated = oAuth2Client.credentials;
  if (!updated.access_token || !updated.expiry_date) {
    throw new Error("Failed to refresh access token.");
  }

  await saveTokens(userId, {
    access_token: updated.access_token,
    refresh_token:
      updated.refresh_token || oAuth2Client.credentials.refresh_token,
    scope: updated.scope,
    token_type: updated.token_type,
    expiry_date: updated.expiry_date,
  });

  return {
    connected: true,
    scope: updated.scope,
    expiryDate: updated.expiry_date,
  };
};

module.exports = {
  generateAuthUrl,
  exchangeCodeForTokens,
  refreshAccessTokenIfNeeded,
  getStoredTokens,
};
