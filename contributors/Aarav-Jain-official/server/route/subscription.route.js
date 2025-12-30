import { Router } from 'express';
import {
  createSubscription,
  getSubscriptions,
  getSubscriptionById,
} from '../controller/subscription.controller.js'


const router = Router();



// POST /api/subscriptions - Create a new subscription
router.post('/', createSubscription);

// GET /api/subscriptions - Get all subscriptions for authenticated user
router.get('/', getSubscriptions);

// GET /api/subscriptions/:id - Get single subscription by ID
router.get('/:id', getSubscriptionById);

export default router;
