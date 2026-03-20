import { Router } from 'express';
import * as coursesController from './courses.controller';
import { requireAuth } from '../../middleware/requireAuth';
import { attachUser, requireType } from '../../middleware/authorize';

const router = Router();

// Public - specific routes FIRST
router.get('/instructor/my-courses',
  requireAuth, attachUser, requireType('instructor'),
  coursesController.getInstructorCourses
);

// Public - generic routes AFTER
router.get('/', coursesController.listCourses);
router.get('/:id', coursesController.getCourse);

// Instructor only
router.post('/',
  requireAuth, attachUser, requireType('instructor'),
  coursesController.createCourse
);
router.post('/:id/publish',
  requireAuth, attachUser, requireType('instructor'),
  coursesController.publishCourse
);
router.post('/:id/unpublish',
  requireAuth, attachUser, requireType('instructor'),
  coursesController.unpublishCourse
);
router.patch('/:id',
  requireAuth, attachUser, requireType('instructor'),
  coursesController.editCourse
);

export default router;