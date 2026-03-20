import { Router } from 'express';
import * as sessionsController from './sessions.controller';
import { requireAuth } from '../../middleware/requireAuth';
import { attachUser, requireType } from '../../middleware/authorize';

const router = Router({ mergeParams: true });

// GET /courses/:courseId/sessions - public
router.get('/', sessionsController.getSessionsByCourse);

// POST /courses/:courseId/sessions - instructor only
router.post(
  '/',
  requireAuth, attachUser, requireType('instructor'),
  sessionsController.createSession
);

export default router;