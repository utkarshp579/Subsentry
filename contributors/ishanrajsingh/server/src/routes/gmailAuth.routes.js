import { Router } from 'express';
import requireAuth from '../middleware/requireAuth.js';
import {
  startGmailAuth,
  gmailCallback,
  gmailStatus,
  disconnectGmail,
  fetchEmails,
  parseEmails,
  saveSubscriptions,
} from '../controllers/gmailAuthController.js';

const router = Router();

router.get('/connect', requireAuth, startGmailAuth);
router.get('/callback', gmailCallback);
router.get('/status', requireAuth, gmailStatus);
router.post('/disconnect', requireAuth, disconnectGmail);
router.get('/emails', requireAuth, fetchEmails);
router.post('/parse', requireAuth, parseEmails);
router.post('/save', requireAuth, saveSubscriptions);

export default router;