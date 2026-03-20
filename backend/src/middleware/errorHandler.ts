import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../utils/response';
import { log } from '../utils/logger';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ZodError) {
    return sendError(res, 'Validation error', 422, err.flatten().fieldErrors);
  }

  if (err instanceof AppError) {
    log.warn(err.message, { statusCode: err.statusCode, path: req.path });
    return sendError(res, err.message, err.statusCode);
  }

  log.error('Unhandled error', { error: String(err), path: req.path });
  return sendError(res, 'Internal server error', 500);
};

export class AppError extends Error {
  constructor(public message: string, public statusCode = 400) {
    super(message);
    this.name = 'AppError';
  }
}