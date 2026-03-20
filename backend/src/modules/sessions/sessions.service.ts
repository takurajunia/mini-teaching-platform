import * as repo from './sessions.repository';
import { findCourseById } from '../courses/courses.repository';
import { AppError } from '../../middleware/errorHandler';

export const createSession = async (
  courseId: string,
  instructorId: string,
  title: string,
  scheduledAt: string,
  durationMinutes: number
) => {
  const course = await findCourseById(courseId);
  if (!course) throw new AppError('Course not found', 404);
  if (course.instructor_id !== instructorId)
    throw new AppError('Forbidden: you do not own this course', 403);
  return repo.createSession(courseId, instructorId, title, scheduledAt, durationMinutes);
};

export const getSessionsByCourse = async (courseId: string) => {
  const course = await findCourseById(courseId);
  if (!course) throw new AppError('Course not found', 404);
  return repo.findSessionsByCourse(courseId);
};

export const getSessionsByInstructor = async (instructorId: string) => {
  return repo.findSessionsByInstructor(instructorId);
};

export const completeSession = async (sessionId: string, instructorId: string) => {
  const session = await repo.findSessionById(sessionId);
  if (!session) throw new AppError('Session not found', 404);
  if (session.instructor_id !== instructorId)
    throw new AppError('Forbidden: you do not own this session', 403);
  if (session.status === 'completed')
    throw new AppError('Session is already completed', 400);
  if (session.status === 'paid')
    throw new AppError('Session has already been paid out', 400);
  return repo.updateSessionStatus(sessionId, 'completed');
};