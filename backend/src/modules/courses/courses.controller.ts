import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as coursesService from './courses.service';
import { sendSuccess } from '../../utils/response';

type CourseIdParams = {
  id: string;
};

const createCourseSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.number().min(0),
});

const editCourseSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  price: z.number().min(0).optional(),
});

export const createCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, price } = createCourseSchema.parse(req.body);
    const instructorId = (req as any).user.id;
    const course = await coursesService.createCourse(instructorId, title, description, price);
    sendSuccess(res, course, 201, 'Course created');
  } catch (err) { next(err); }
};

export const listCourses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courses = await coursesService.listPublishedCourses();
    sendSuccess(res, courses);
  } catch (err) { next(err); }
};

export const getCourse = async (req: Request<CourseIdParams>, res: Response, next: NextFunction) => {
  try {
    const course = await coursesService.getCourseById(req.params.id);
    sendSuccess(res, course);
  } catch (err) { next(err); }
};

export const getInstructorCourses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const instructorId = (req as any).user.id;
    const courses = await coursesService.getInstructorCourses(instructorId);
    sendSuccess(res, courses);
  } catch (err) { next(err); }
};

export const publishCourse = async (req: Request<CourseIdParams>, res: Response, next: NextFunction) => {
  try {
    const instructorId = (req as any).user.id;
    const course = await coursesService.publishCourse(req.params.id, instructorId);
    sendSuccess(res, course, 200, 'Course published');
  } catch (err) { next(err); }
};

export const unpublishCourse = async (req: Request<CourseIdParams>, res: Response, next: NextFunction) => {
  try {
    const instructorId = (req as any).user.id;
    const course = await coursesService.unpublishCourse(req.params.id, instructorId);
    sendSuccess(res, course, 200, 'Course unpublished');
  } catch (err) { next(err); }
};

export const editCourse = async (req: Request<CourseIdParams>, res: Response, next: NextFunction) => {
  try {
    const fields = editCourseSchema.parse(req.body);
    const instructorId = (req as any).user.id;
    const course = await coursesService.editCourse(req.params.id, instructorId, fields);
    sendSuccess(res, course, 200, 'Course updated');
  } catch (err) { next(err); }
};