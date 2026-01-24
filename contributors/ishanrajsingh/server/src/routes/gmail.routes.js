import { Router } from 'express';
import {
    initiateAuth,
    handleCallback,
    getStatus,
    disconnect,
    fetchEmails,
    parseEmailsEndpoint,
    saveSubscriptions,
} from '../controllers/gmail.controller.js';

const router = Router();

/**
 * Gmail OAuth Routes
 * 
 * GET  /api/gmail/auth       - Get OAuth URL to start connection
 * GET  /api/gmail/callback   - Handle Google OAuth callback
 * GET  /api/gmail/status     - Check connection status
 * POST /api/gmail/disconnect - Remove Gmail connection
 * GET  /api/gmail/emails     - Fetch transactional emails
 * POST /api/gmail/parse      - Parse emails for subscription data
 * POST /api/gmail/save       - Save parsed emails as subscriptions
 */

// Start OAuth flow - returns auth URL
router.get('/auth', initiateAuth);

// OAuth callback from Google (no auth middleware - state validates user)
router.get('/callback', handleCallback);

// Check connection status
router.get('/status', getStatus);

// Disconnect Gmail
router.post('/disconnect', disconnect);

// Fetch transactional emails
router.get('/emails', fetchEmails);

// Parse emails for subscription data
router.post('/parse', parseEmailsEndpoint);

// Save parsed emails as subscriptions
router.post('/save', saveSubscriptions);

export default router;



