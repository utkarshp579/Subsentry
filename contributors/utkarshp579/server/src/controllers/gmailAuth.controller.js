import { GmailToken } from "../models/GmailToken.js";
import { GMAIL_ERRORS } from "../constants/gmail.constants.js";
import {
  createAuthUrl,
  fetchTokensFromCode,
  fetchGmailAddress,
  refreshExpiredAccessToken,
  encrypt,
  createCsrfState,
} from "../config/googleOAuth.js";

// In-memory CSRF store (use Redis in production)
const csrfStore = new Map();

export const startGmailAuth = async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const csrf = createCsrfState();
  csrfStore.set(csrf, { uid: req.user.id, ts: Date.now() });

  // Clean up old CSRF tokens (older than 10 minutes)
  const limit = Date.now() - 10 * 60 * 1000;
  for (const [key, val] of csrfStore.entries()) {
    if (val.ts < limit) csrfStore.delete(key);
  }

  const url = createAuthUrl(csrf);
  res.json({ success: true, url });
};

export const gmailCallback = async (req, res) => {
  const { code, state, error } = req.query;
  const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

  if (error === "access_denied") {
    return res.redirect(`${clientUrl}/settings?gmail=${GMAIL_ERRORS.DENIED}`);
  }

  if (!code || !state) {
    return res.redirect(
      `${clientUrl}/settings?gmail=${GMAIL_ERRORS.CALLBACK_FAILED}`,
    );
  }

  const record = csrfStore.get(state);
  if (!record) {
    return res.redirect(
      `${clientUrl}/settings?gmail=${GMAIL_ERRORS.INVALID_STATE}`,
    );
  }

  csrfStore.delete(state);

  try {
    const tokens = await fetchTokensFromCode(code);

    if (!tokens?.access_token || !tokens?.refresh_token) {
      return res.redirect(
        `${clientUrl}/settings?gmail=${GMAIL_ERRORS.TOKEN_ERROR}`,
      );
    }

    const email = await fetchGmailAddress(tokens.access_token);

    const expiry = new Date(Date.now() + (tokens.expiry_date || 3600 * 1000));

    await GmailToken.findOneAndUpdate(
      { userId: record.uid },
      {
        userId: record.uid,
        gmailAddress: email,
        encryptedAccessToken: encrypt(tokens.access_token),
        encryptedRefreshToken: encrypt(tokens.refresh_token),
        accessTokenExpiresAt: expiry,
        connectedOn: new Date(),
      },
      { upsert: true },
    );

    res.redirect(`${clientUrl}/settings?gmail=${GMAIL_ERRORS.SUCCESS}`);
  } catch {
    res.redirect(`${clientUrl}/settings?gmail=${GMAIL_ERRORS.CALLBACK_FAILED}`);
  }
};

export const gmailStatus = async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const record = await GmailToken.findOne({ userId: req.user.id });

  if (!record) {
    return res.json({ success: true, connected: false });
  }

  // Check if token is expired and refresh if needed
  if (Date.now() > record.accessTokenExpiresAt.getTime()) {
    try {
      const fresh = await refreshExpiredAccessToken(
        record.encryptedRefreshToken,
      );

      record.encryptedAccessToken = encrypt(fresh.access_token);
      record.accessTokenExpiresAt = new Date(
        fresh.expiry_date || Date.now() + 3600 * 1000,
      );

      await record.save();
    } catch {
      // Token refresh failed, remove connection
      await GmailToken.deleteOne({ userId: req.user.id });
      return res.json({ success: true, connected: false });
    }
  }

  res.json({
    success: true,
    connected: true,
    email: record.gmailAddress,
    connectedOn: record.connectedOn,
  });
};

export const disconnectGmail = async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const result = await GmailToken.deleteOne({ userId: req.user.id });

  if (!result.deletedCount) {
    return res
      .status(404)
      .json({ success: false, message: "Gmail not connected" });
  }

  res.json({ success: true, message: "Gmail disconnected" });
};
