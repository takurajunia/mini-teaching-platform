import { Router } from 'express';
import * as payoutsController from './payouts.controller';
import { requireAuth } from '../../middleware/requireAuth';
import { attachUser, requireType, requireRole } from '../../middleware/authorize';

const router = Router();

// Instructor routes
router.get(
  '/balance',
  requireAuth, attachUser, requireType('instructor'),
  payoutsController.getBalance
);

router.post(
  '/requests',
  requireAuth, attachUser, requireType('instructor'),
  payoutsController.requestPayout
);

// Instructor or admin
router.get(
  '/requests',
  requireAuth, attachUser,
  payoutsController.getPayoutRequests
);

// Admin only
router.post(
  '/requests/:id/approve',
  requireAuth, attachUser, requireRole('admin'),
  payoutsController.approvePayout
);

router.post(
  '/requests/:id/reject',
  requireAuth, attachUser, requireRole('admin'),
  payoutsController.rejectPayout
);

export default router;