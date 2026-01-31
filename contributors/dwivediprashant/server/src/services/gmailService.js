const { google } = require("googleapis");
const GmailToken = require("../models/gmailToken");
const { getOAuth2Client, GMAIL_SCOPES } = require("../config/gmail");
const { encrypt, decrypt } = require("../utils/tokenCrypto");

const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";

const DEFAULT_QUERY = "invoice OR subscription OR renewal OR payment";
const METADATA_HEADERS = ["Subject", "From", "Date"];

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
  if (!tokens || !tokens.access_token) {
    throw new Error("Missing access token.");
  }

  if (!tokens.refresh_token) {
    const existing = await GmailToken.findOne({ userId });
    if (!existing) {
      throw new Error(
        "Missing refresh token. Ensure consent is granted with offline access.",
      );
    }
    tokens.refresh_token = decrypt(existing.refreshTokenEncrypted);
  }
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

  const { token } = await oAuth2Client.getAccessToken();
  if (!token) {
    throw new Error("Failed to refresh access token.");
  }

  const updated = oAuth2Client.credentials;
  if (!updated.access_token || !updated.expiry_date) {
    throw new Error("Failed to refresh access token.");
  }

  await saveTokens(userId, {
    access_token: updated.access_token || token,
    refresh_token:
      updated.refresh_token || oAuth2Client.credentials.refresh_token,
    scope: updated.scope,
    token_type: updated.token_type,
    expiry_date: updated.expiry_date,
  });
  if (!updated.expiry_date) {
    await oAuth2Client.getAccessToken();

    const updated = oAuth2Client.credentials;
    if (!updated.access_token || !updated.expiry_date) {
      throw new Error("Failed to refresh access token.");
    }

    await saveTokens(userId, {
      access_token: token,
      refresh_token: updated.refresh_token,
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
  }

  return {
    connected: true,
    scope: updated.scope,
    expiryDate: updated.expiry_date,
  };
};

const getHeaderValue = (headers, name) => {
  if (!headers || !Array.isArray(headers)) {
    return null;
  }
  const header = headers.find(
    (item) => item.name && item.name.toLowerCase() === name.toLowerCase(),
  );
  return header ? header.value : null;
};

const fetchTransactionalEmails = async ({
  userId,
  query,
  maxResults,
  pageToken,
}) => {
  const refreshed = await refreshAccessTokenIfNeeded(userId);
  if (!refreshed) {
    const error = new Error("No Gmail connection found.");
    error.code = 404;
    throw error;
  }

  const authClient = await getAuthorizedClient(userId);
  if (!authClient) {
    const error = new Error("No Gmail connection found.");
    error.code = 404;
    throw error;
  }

  const gmail = google.gmail({ version: "v1", auth: authClient });

  const safeMaxResults = Math.min(Math.max(maxResults || 10, 1), 50);
  const q = query && query.trim().length > 0 ? query : DEFAULT_QUERY;

  const listResponse = await gmail.users.messages.list({
    userId: "me",
    q,
    maxResults: safeMaxResults,
    pageToken,
  });

  const messages = listResponse.data.messages || [];
  if (messages.length === 0) {
    return {
      emails: [],
      nextPageToken: listResponse.data.nextPageToken || null,
      resultSizeEstimate: listResponse.data.resultSizeEstimate || 0,
      query: q,
    };
  }

  const emailDetails = await Promise.all(
    messages.map(async (message) => {
      const detail = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
        format: "metadata",
        metadataHeaders: METADATA_HEADERS,
      });

      const headers = detail.data.payload?.headers || [];

      return {
        id: detail.data.id,
        threadId: detail.data.threadId,
        subject: getHeaderValue(headers, "Subject"),
        sender: getHeaderValue(headers, "From"),
        timestamp: detail.data.internalDate
          ? Number(detail.data.internalDate)
          : null,
      };
    }),
  );

  return {
    emails: emailDetails,
    nextPageToken: listResponse.data.nextPageToken || null,
    resultSizeEstimate: listResponse.data.resultSizeEstimate || 0,
    query: q,
  };
};

  module.exports = {
  generateAuthUrl,
  exchangeCodeForTokens,
  refreshAccessTokenIfNeeded,
  getStoredTokens,
  fetchTransactionalEmails,
};
