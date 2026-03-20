import * as repo from './enrollments.repository';
import { findCourseById } from '../courses/courses.repository';
import { AppError } from '../../middleware/errorHandler';

export const enrollInCourse = async (studentId: string, courseId: string) => {
  const course = await findCourseById(courseId);
  if (!course) throw new AppError('Course not found', 404);
  if (course.status !== 'published')
    throw new AppError('Cannot enroll in an unpublished course', 400);

  const existing = await repo.findEnrollment(studentId, courseId);
  if (existing) throw new AppError('Already enrolled in this course', 409);

  return repo.createEnrollment(studentId, courseId);
};

export const getMyEnrollments = async (studentId: string) => {
  return repo.findEnrollmentsByStudent(studentId);
};

export const getCourseEnrollmentCount = async (courseId: string) => {
  return repo.countEnrollmentsByCourse(courseId);
};