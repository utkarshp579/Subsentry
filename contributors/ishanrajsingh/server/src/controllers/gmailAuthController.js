import { GmailToken } from '../models/GmailToken.js';
import {
  createAuthUrl,
  fetchTokensFromCode,
  fetchGmailAddress,
  refreshExpiredAccessToken,
  encrypt,
  decrypt,
  createCsrfState,
} from '../config/googleOAuth.js';
import { parseEmails as parseEmailsService, parseAndGroupByService } from '../services/parseEmails.js';
import { fetchTransactionalEmails } from '../services/fetchEmails.js';
import { saveEmailSubscriptions } from '../services/subscriptionSave.js';

const csrfStore = new Map();

export const startGmailAuth = async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ success: false });
  }

  const csrf = createCsrfState();
  csrfStore.set(csrf, { uid: req.user.id, ts: Date.now() });

  const limit = Date.now() - 10 * 60 * 1000;
  for (const [key, val] of csrfStore.entries()) {
    if (val.ts < limit) csrfStore.delete(key);
  }

  const url = createAuthUrl(csrf);
  res.json({ success: true, url });
};

export const gmailCallback = async (req, res) => {
  const { code, state, error } = req.query;

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

  if (error === 'access_denied') {
    return res.redirect(`${clientUrl}/settings?gmail=denied`);
  }

  if (!code || !state) {
    return res.redirect(`${clientUrl}/settings?gmail=error`);
  }

  const record = csrfStore.get(state);
  if (!record) {
    return res.redirect(`${clientUrl}/settings?gmail=invalid_state`);
  }

  csrfStore.delete(state);

  try {
    const tokens = await fetchTokensFromCode(code);

    if (!tokens?.access_token || !tokens?.refresh_token) {
      return res.redirect(`${clientUrl}/settings?gmail=token_error`);
    }

    const email = await fetchGmailAddress(tokens.access_token);

    const expiry = new Date(
      Date.now() + (tokens.expiry_date || 3600 * 1000)
    );

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
      { upsert: true }
    );

    res.redirect(`${clientUrl}/settings?gmail=success`);
  } catch {
    res.redirect(`${clientUrl}/settings?gmail=callback_failed`);
  }
};

export const gmailStatus = async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ success: false });
  }

  const record = await GmailToken.findOne({ userId: req.user.id });

  if (!record) {
    return res.json({ success: true, connected: false });
  }

  if (Date.now() > record.accessTokenExpiresAt.getTime()) {
    try {
      const fresh = await refreshExpiredAccessToken(
        record.encryptedRefreshToken
      );

      record.encryptedAccessToken = encrypt(fresh.access_token);
      record.accessTokenExpiresAt = new Date(
        fresh.expiry_date || Date.now() + 3600 * 1000
      );

      await record.save();
    } catch {
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
    return res.status(401).json({ success: false });
  }

  const result = await GmailToken.deleteOne({ userId: req.user.id });

  if (!result.deletedCount) {
    return res.status(404).json({ success: false });
  }

  res.json({ success: true });
};

export const fetchEmails = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
            });
        }

        // Parse query parameters
        const maxResults = Math.min(parseInt(req.query.limit) || 20, 100);
        const pageToken = req.query.pageToken || null;
        const keywords = req.query.keywords
            ? req.query.keywords.split(',').map(k => k.trim())
            : undefined;

        const result = await fetchTransactionalEmails(req.user.id, {
            maxResults,
            pageToken,
            keywords,
        });

        res.json({
            success: true,
            ...result,
        });
    } catch (error) {
        // Handle specific error cases
        if (error.message === 'Gmail not connected') {
            return res.status(400).json({
                success: false,
                error: 'Gmail not connected. Please connect your Gmail first.',
            });
        }

        // Handle rate limiting
        if (error.code === 429 || error.message?.includes('Rate Limit')) {
            return res.status(429).json({
                success: false,
                error: 'Rate limit exceeded. Please try again later.',
                retryAfter: 60,
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to fetch emails',
        });
    }
};

export const parseEmails = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
            });
        }

        if (req.body.emails && Array.isArray(req.body.emails)) {
            const parsed = parseEmailsService(req.body.emails);
            const grouped = req.body.groupByService ? parseAndGroupByService(req.body.emails) : null;

            return res.json({
                success: true,
                parsed,
                grouped,
                count: parsed.length,
            });
        }

        const maxResults = Math.min(parseInt(req.query.limit) || 20, 100);
        const pageToken = req.query.pageToken || null;

        const fetchResult = await fetchTransactionalEmails(req.user.id, {
            maxResults,
            pageToken,
        });

        if (!fetchResult.emails || fetchResult.emails.length === 0) {
            return res.json({
                success: true,
                parsed: [],
                message: 'No emails to parse',
            });
        }

        const parsed = parseEmailsService(fetchResult.emails);
        const grouped = parseAndGroupByService(fetchResult.emails);

        res.json({
            success: true,
            parsed,
            grouped,
            count: parsed.length,
            nextPageToken: fetchResult.nextPageToken,
        });
    } catch (error) {
        console.error('[Parse Emails] ERROR:', error.message);
        console.error('[Parse Emails] Stack:', error.stack);

        if (error.message === 'Gmail not connected') {
            return res.status(400).json({
                success: false,
                error: 'Gmail not connected. Please connect your Gmail first.',
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to parse emails',
        });
    }
};

export const saveSubscriptions = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
            });
        }

        let parsedEmails = req.body.parsedEmails;

        if (!parsedEmails || !Array.isArray(parsedEmails) || parsedEmails.length === 0) {
            const maxResults = Math.min(parseInt(req.query.limit) || 50, 100);

            const fetchResult = await fetchTransactionalEmails(req.user.id, {
                maxResults,
            });

            if (!fetchResult.emails || fetchResult.emails.length === 0) {
                return res.json({
                    success: true,
                    saved: 0,
                    skipped: 0,
                    message: 'No emails to process',
                });
            }

            parsedEmails = parseEmailsService(fetchResult.emails);
        }

        const result = await saveEmailSubscriptions(parsedEmails, req.user.id);

        res.json({
            success: true,
            ...result,
        });
    } catch (error) {
        console.error('[Save Subscriptions] ERROR:', error.message);

        if (error.message === 'Gmail not connected') {
            return res.status(400).json({
                success: false,
                error: 'Gmail not connected. Please connect your Gmail first.',
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to save subscriptions',
        });
    }
};