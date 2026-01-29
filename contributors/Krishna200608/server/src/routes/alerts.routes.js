import { Router } from 'express';
import { getRules, updateRules, getUpcoming } from '../controllers/alerts.controller.js';
import attachUser from '../middleware/attachUser.js';

const router = Router();

// Protect all routes
router.use(attachUser);

// Rules Management
router.get('/rules', getRules);
router.post('/rules', updateRules);

// Upcoming Renewals (based on rules)
router.get('/upcoming', getUpcoming);

export default router;
