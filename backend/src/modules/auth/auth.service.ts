import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByEmail, findUserById, createUser, User } from './auth.repository';
import { AppError } from '../../middleware/errorHandler';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const sanitizeUser = (user: User) => {
  const { password_hash, ...safe } = user;
  return safe;
};

export const register = async (
  email: string,
  password: string,
  type: 'student' | 'instructor'
) => {
  const existing = await findUserByEmail(email);
  if (existing) throw new AppError('Email already in use', 409);

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser(email, passwordHash, type);
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);

  return { user: sanitizeUser(user), token };
};

export const login = async (email: string, password: string) => {
  const user = await findUserByEmail(email);
  if (!user) throw new AppError('Invalid credentials', 401);

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new AppError('Invalid credentials', 401);

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);

  return { user: sanitizeUser(user), token };
};

export const getMe = async (userId: string) => {
  const user = await findUserById(userId);
  if (!user) throw new AppError('User not found', 404);
  return sanitizeUser(user);
};