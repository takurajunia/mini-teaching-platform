import { pool } from '../../db';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'user';
  type: 'student' | 'instructor' | null;
  created_at: Date;
  updated_at: Date;
}

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await pool.query<User>(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
};

export const findUserById = async (id: string): Promise<User | null> => {
  const result = await pool.query<User>(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
};

export const createUser = async (
  email: string,
  passwordHash: string,
  type: 'student' | 'instructor'
): Promise<User> => {
  const result = await pool.query<User>(
    `INSERT INTO users (email, password_hash, role, type)
     VALUES ($1, $2, 'user', $3)
     RETURNING *`,
    [email, passwordHash, type]
  );
  return result.rows[0];
};