import { Router } from 'express';
import * as enrollmentsController from './enrollments.controller';
import { requireAuth } from '../../middleware/requireAuth';
import { attachUser, requireType } from '../../middleware/authorize';

const router = Router();

// POST /courses/:id/enroll - student only
router.post(
  '/courses/:id/enroll',
  requireAuth, attachUser, requireType('student'),
  enrollmentsController.enrollInCourse
);

// GET /me/enrollments - student only
router.get(
  '/me/enrollments',
  requireAuth, attachUser, requireType('student'),
  enrollmentsController.getMyEnrollments
);

export default router;