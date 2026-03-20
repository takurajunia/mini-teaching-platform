import { pool } from '../../db';

export interface Session {
  id: string;
  course_id: string;
  instructor_id: string;
  title: string;
  scheduled_at: Date;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'paid';
  created_at: Date;
  updated_at: Date;
}

export const createSession = async (
  courseId: string,
  instructorId: string,
  title: string,
  scheduledAt: string,
  durationMinutes: number
): Promise<Session> => {
  const result = await pool.query<Session>(
    `INSERT INTO sessions (course_id, instructor_id, title, scheduled_at, duration_minutes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [courseId, instructorId, title, scheduledAt, durationMinutes]
  );
  return result.rows[0];
};

export const findSessionsByCourse = async (courseId: string): Promise<Session[]> => {
  const result = await pool.query<Session>(
    'SELECT * FROM sessions WHERE course_id = $1 ORDER BY scheduled_at ASC',
    [courseId]
  );
  return result.rows;
};

export const findSessionsByInstructor = async (instructorId: string): Promise<Session[]> => {
  const result = await pool.query<Session>(
    'SELECT * FROM sessions WHERE instructor_id = $1 ORDER BY scheduled_at ASC',
    [instructorId]
  );
  return result.rows;
};

export const findSessionById = async (id: string): Promise<Session | null> => {
  const result = await pool.query<Session>(
    'SELECT * FROM sessions WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
};

export const updateSessionStatus = async (
  id: string,
  status: 'scheduled' | 'completed' | 'paid'
): Promise<Session> => {
  const result = await pool.query<Session>(
    `UPDATE sessions SET status = $1, updated_at = NOW()
     WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows[0];
};