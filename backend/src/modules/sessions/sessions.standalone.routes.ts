import { Router } from 'express';
import * as sessionsController from './sessions.controller';
import { requireAuth } from '../../middleware/requireAuth';
import { attachUser, requireType } from '../../middleware/authorize';

const router = Router();

// GET /sessions?instructorId=... (admin or self)
router.get(
  '/my',
  requireAuth, attachUser, requireType('instructor'),
  sessionsController.getMySessions
);

// POST /sessions/:id/complete
router.post(
  '/:id/complete',
  requireAuth, attachUser, requireType('instructor'),
  sessionsController.completeSession
);

export default router;