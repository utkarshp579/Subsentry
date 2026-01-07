import { Router } from 'express';
import requireAuth from '../middleware/requireAuth.js';
import {
  createSubscription,
  getUserSubscriptions,
} from '../controllers/subscription.controller.js';

const router = Router();

router.post('/', requireAuth, createSubscription);
router.get('/', requireAuth, getUserSubscriptions);

export default router;
