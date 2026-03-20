import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as sessionsService from './sessions.service';
import { sendSuccess } from '../../utils/response';

type CourseIdParams = {
  courseId: string;
};

type SessionIdParams = {
  id: string;
};

const createSessionSchema = z.object({
  title: z.string().min(3),
  scheduled_at: z.string().min(1),
  duration_minutes: z.number().int().min(15).default(60),
});

export const createSession = async (req: Request<CourseIdParams>, res: Response, next: NextFunction) => {
  try {
    const { title, scheduled_at, duration_minutes } = createSessionSchema.parse(req.body);
    const instructorId = (req as any).user.id;
    const session = await sessionsService.createSession(
      req.params.courseId, instructorId, title, scheduled_at, duration_minutes
    );
    sendSuccess(res, session, 201, 'Session created');
  } catch (err) { next(err); }
};

export const getSessionsByCourse = async (req: Request<CourseIdParams>, res: Response, next: NextFunction) => {
  try {
    const sessions = await sessionsService.getSessionsByCourse(req.params.courseId);
    sendSuccess(res, sessions);
  } catch (err) { next(err); }
};

export const getMySessions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const instructorId = (req as any).user.id;
    const sessions = await sessionsService.getSessionsByInstructor(instructorId);
    sendSuccess(res, sessions);
  } catch (err) { next(err); }
};

export const completeSession = async (req: Request<SessionIdParams>, res: Response, next: NextFunction) => {
  try {
    const instructorId = (req as any).user.id;
    const session = await sessionsService.completeSession(req.params.id, instructorId);
    sendSuccess(res, session, 200, 'Session marked as completed');
  } catch (err) { next(err); }
};