import { GmailToken } from '../models/GmailToken.js';
import {
    generateAuthUrl,
    exchangeCodeForTokens,
    getUserEmail,
    refreshAccessToken,
    encryptToken,
    decryptToken,
    generateState,
} from '../config/gmail.config.js';
import { fetchTransactionalEmails } from '../services/emailFetcher.js';
import { parseEmails as parseEmailsService, parseAndGroupByService } from '../services/emailParser.js';
import { saveEmailSubscriptions, saveCandidates } from '../services/subscriptionSaver.js';

// In-memory state store for CSRF protection (use Redis in production)
const stateStore = new Map();

/**
 * Initiate Gmail OAuth flow
 * GET /api/gmail/auth
 */
export const initiateAuth = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
            });
        }

        // Generate state for CSRF protection
        const state = generateState();
        stateStore.set(state, {
            userId: req.user.id,
            timestamp: Date.now(),
        });

        // Clean up old states (older than 10 minutes)
        const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
        for (const [key, value] of stateStore.entries()) {
            if (value.timestamp < tenMinutesAgo) {
                stateStore.delete(key);
            }
        }

        const authUrl = generateAuthUrl(state);

        res.json({
            success: true,
            authUrl,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to initiate OAuth flow',
        });
    }
};

/**
 * Handle OAuth callback from Google
 * GET /api/gmail/callback
 */
export const handleCallback = async (req, res) => {
    try {
        const { code, state, error } = req.query;

        console.log('[Gmail OAuth] Callback received:', { code: !!code, state: !!state, error });

        // Handle user denial
        if (error === 'access_denied') {
            return res.redirect(
                `${process.env.CLIENT_URL || 'http://localhost:3000'}/settings?gmail=denied`
            );
        }

        if (!code || !state) {
            console.log('[Gmail OAuth] Missing params:', { code: !!code, state: !!state });
            return res.redirect(
                `${process.env.CLIENT_URL || 'http://localhost:3000'}/settings?gmail=error&message=missing_params`
            );
        }

        // Validate state for CSRF protection
        const stateData = stateStore.get(state);
        console.log('[Gmail OAuth] State validation:', { stateExists: !!stateData, storeSize: stateStore.size });

        if (!stateData) {
            return res.redirect(
                `${process.env.CLIENT_URL || 'http://localhost:3000'}/settings?gmail=error&message=invalid_state`
            );
        }

        const { userId } = stateData;
        stateStore.delete(state);

        console.log('[Gmail OAuth] Exchanging code for tokens...');
        // Exchange code for tokens
        const tokens = await exchangeCodeForTokens(code);
        console.log('[Gmail OAuth] Tokens received:', {
            hasAccessToken: !!tokens.access_token,
            hasRefreshToken: !!tokens.refresh_token
        });

        if (!tokens.access_token || !tokens.refresh_token) {
            return res.redirect(
                `${process.env.CLIENT_URL || 'http://localhost:3000'}/settings?gmail=error&message=token_exchange_failed`
            );
        }

        // Get user email
        console.log('[Gmail OAuth] Getting user email...');
        const email = await getUserEmail(tokens.access_token);
        console.log('[Gmail OAuth] Email:', email);

        // Calculate expiry time
        const expiresAt = new Date(Date.now() + (tokens.expiry_date || 3600 * 1000));

        // Encrypt tokens before storage
        const encryptedAccessToken = encryptToken(tokens.access_token);
        const encryptedRefreshToken = encryptToken(tokens.refresh_token);

        // Store or update tokens
        console.log('[Gmail OAuth] Saving to database...');
        await GmailToken.findOneAndUpdate(
            { userId },
            {
                userId,
                email,
                accessToken: encryptedAccessToken,
                refreshToken: encryptedRefreshToken,
                expiresAt,
                connectedAt: new Date(),
            },
            { upsert: true, new: true }
        );

        console.log('[Gmail OAuth] Success! Redirecting...');
        res.redirect(
            `${process.env.CLIENT_URL || 'http://localhost:3000'}/settings?gmail=success`
        );
    } catch (error) {
        console.error('[Gmail OAuth] ERROR:', error.message);
        console.error('[Gmail OAuth] Stack:', error.stack);
        res.redirect(
            `${process.env.CLIENT_URL || 'http://localhost:3000'}/settings?gmail=error&message=callback_failed`
        );
    }
};

/**
 * Get Gmail connection status
 * GET /api/gmail/status
 */
export const getStatus = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
            });
        }

        const gmailToken = await GmailToken.findOne({ userId: req.user.id });

        if (!gmailToken) {
            return res.json({
                success: true,
                connected: false,
            });
        }

        // Check if token is expired and try to refresh
        const isExpired = new Date() > new Date(gmailToken.expiresAt);

        if (isExpired) {
            try {
                const newTokens = await refreshAccessToken(gmailToken.refreshToken);

                // Update stored tokens
                gmailToken.accessToken = encryptToken(newTokens.access_token);
                gmailToken.expiresAt = new Date(newTokens.expiry_date || Date.now() + 3600 * 1000);
                await gmailToken.save();
            } catch (refreshError) {
                // Refresh failed, user needs to reconnect
                await GmailToken.deleteOne({ userId: req.user.id });
                return res.json({
                    success: true,
                    connected: false,
                    message: 'Token expired, please reconnect',
                });
            }
        }

        res.json({
            success: true,
            connected: true,
            email: gmailToken.email,
            connectedAt: gmailToken.connectedAt,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to get Gmail status',
        });
    }
};

/**
 * Disconnect Gmail account
 * POST /api/gmail/disconnect
 */
export const disconnect = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
            });
        }

        const result = await GmailToken.deleteOne({ userId: req.user.id });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'No Gmail connection found',
            });
        }

        res.json({
            success: true,
            message: 'Gmail disconnected successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to disconnect Gmail',
        });
    }
};

/**
 * Fetch transactional emails
 * GET /api/gmail/emails
 */
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

/**
 * Parse fetched emails for subscription data
 * POST /api/gmail/parse
 */
export const parseEmailsEndpoint = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
            });
        }

        // Option 1: Parse provided emails from request body
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

        // Option 2: Fetch and parse emails
        const maxResults = Math.min(parseInt(req.query.limit) || 20, 100);
        const pageToken = req.query.pageToken || null;

        // Fetch emails first
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

        // Parse fetched emails
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

/**
 * Save subscriptions from parsed emails
 * POST /api/gmail/save
 */
export const saveSubscriptions = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
            });
        }

        // Option 1: Use provided parsed emails from request body
        let parsedEmails = req.body.parsedEmails;

        // Option 2: Fetch and parse if not provided
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

        // V2: Save as Candidates
        // We detect if it's V2 by the presence of 'vendorName' (from new parser)
        // or we just default to V2 for improved flow
        let result;
        if (parsedEmails.length > 0 && (parsedEmails[0].vendorName || parsedEmails[0].confidenceScore !== undefined)) {
            console.log('[Gmail Controller] Using V2 Candidate Saving');
            result = await saveCandidates(parsedEmails, req.user.id);
        } else {
            console.log('[Gmail Controller] Using Legacy Subscription Saving');
            // Check if we can re-parse legacy format to new format?
            // For now, fallback
            result = await saveEmailSubscriptions(parsedEmails, req.user.id);
        }

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
