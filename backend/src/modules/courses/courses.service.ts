import * as repo from './courses.repository';
import { AppError } from '../../middleware/errorHandler';

export const createCourse = async (
  instructorId: string,
  title: string,
  description: string,
  price: number
) => {
  return repo.createCourse(instructorId, title, description, price);
};

export const listPublishedCourses = async () => {
  return repo.findAllPublished();
};

export const getCourseById = async (id: string) => {
  const course = await repo.findCourseById(id);
  if (!course) throw new AppError('Course not found', 404);
  return course;
};

export const getInstructorCourses = async (instructorId: string) => {
  return repo.findCoursesByInstructor(instructorId);
};

export const publishCourse = async (courseId: string, instructorId: string) => {
  const course = await repo.findCourseById(courseId);
  if (!course) throw new AppError('Course not found', 404);
  if (course.instructor_id !== instructorId)
    throw new AppError('Forbidden: you do not own this course', 403);
  if (course.status === 'published')
    throw new AppError('Course is already published', 400);
  return repo.updateCourseStatus(courseId, 'published');
};

export const unpublishCourse = async (courseId: string, instructorId: string) => {
  const course = await repo.findCourseById(courseId);
  if (!course) throw new AppError('Course not found', 404);
  if (course.instructor_id !== instructorId)
    throw new AppError('Forbidden: you do not own this course', 403);
  if (course.status === 'draft')
    throw new AppError('Course is already unpublished', 400);
  return repo.updateCourseStatus(courseId, 'draft');
};

export const editCourse = async (
  courseId: string,
  instructorId: string,
  fields: Partial<{ title: string; description: string; price: number }>
) => {
  const course = await repo.findCourseById(courseId);
  if (!course) throw new AppError('Course not found', 404);
  if (course.instructor_id !== instructorId)
    throw new AppError('Forbidden: you do not own this course', 403);
  return repo.updateCourse(courseId, fields);
};