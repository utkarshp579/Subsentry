import { Router } from 'express';
import requireAuth from '../middleware/requireAuth.js';
import {
  createSubscription,
  getUserSubscriptions,
  updateSubscription,
  deleteSubscription,
} from '../controllers/subscription.controller.js';
import { importEmailSubscriptions } from '../controllers/subscription.controller.js';

const router = Router();

router.post('/', requireAuth, createSubscription);
router.post('/email/import', requireAuth, importEmailSubscriptions);
router.get('/', requireAuth, getUserSubscriptions);
router.put('/:id', requireAuth, updateSubscription);
router.delete('/:id', requireAuth, deleteSubscription);

export default router;
