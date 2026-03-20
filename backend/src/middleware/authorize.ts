import { Request, Response, NextFunction } from 'express';
import { findUserById } from '../modules/auth/auth.repository';
import { sendError } from '../utils/response';

// Attach full user object to request
export const attachUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return sendError(res, 'Unauthorised', 401);

    const user = await findUserById(userId);
    if (!user) return sendError(res, 'User not found', 404);

    (req as any).user = user;
    next();
  } catch (err) {
    next(err);
  }
};

// Check role: 'admin' | 'user'
export const requireRole = (role: 'admin' | 'user') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || user.role !== role) {
      return sendError(res, 'Forbidden: insufficient role', 403);
    }
    next();
  };
};

// Check type: 'student' | 'instructor'
export const requireType = (type: 'student' | 'instructor') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || user.type !== type) {
      return sendError(res, `Forbidden: ${type} access only`, 403);
    }
    next();
  };
};