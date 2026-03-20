import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as authService from './auth.service';
import { sendSuccess } from '../../utils/response';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  type: z.enum(['student', 'instructor']),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, type } = registerSchema.parse(req.body);
    const result = await authService.register(email, password, type);
    sendSuccess(res, result, 201, 'Registration successful');
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await authService.login(email, password);
    sendSuccess(res, result, 200, 'Login successful');
  } catch (err) {
    next(err);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const user = await authService.getMe(userId);
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
};