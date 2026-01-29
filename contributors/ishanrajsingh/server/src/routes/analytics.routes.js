import { Router } from 'express';
import { getOverview } from '../controllers/analytics.controller.js';
import attachUser from '../middleware/attachUser.js';

const router = Router();

// All analytics routes require authentication
router.use(attachUser);

router.get('/overview', getOverview);

export default router;
