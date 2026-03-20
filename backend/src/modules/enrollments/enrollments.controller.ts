import { Request, Response, NextFunction } from 'express';
import * as enrollmentsService from './enrollments.service';
import { sendSuccess } from '../../utils/response';

type CourseIdParams = {
  id: string;
};

export const enrollInCourse = async (req: Request<CourseIdParams>, res: Response, next: NextFunction) => {
  try {
    const studentId = (req as any).user.id;
    const enrollment = await enrollmentsService.enrollInCourse(studentId, req.params.id);
    sendSuccess(res, enrollment, 201, 'Enrolled successfully');
  } catch (err) { next(err); }
};

export const getMyEnrollments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = (req as any).user.id;
    const enrollments = await enrollmentsService.getMyEnrollments(studentId);
    sendSuccess(res, enrollments);
  } catch (err) { next(err); }
};