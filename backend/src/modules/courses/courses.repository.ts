import { pool } from '../../db';

export interface Course {
  id: string;
  instructor_id: string;
  title: string;
  description: string;
  price: number;
  status: 'draft' | 'published';
  created_at: Date;
  updated_at: Date;
}

export const createCourse = async (
  instructorId: string,
  title: string,
  description: string,
  price: number
): Promise<Course> => {
  const result = await pool.query<Course>(
    `INSERT INTO courses (instructor_id, title, description, price)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [instructorId, title, description, price]
  );
  return result.rows[0];
};

export const findAllPublished = async (): Promise<Course[]> => {
  const result = await pool.query<Course>(
    `SELECT * FROM courses WHERE status = 'published' ORDER BY created_at DESC`
  );
  return result.rows;
};

export const findCourseById = async (id: string): Promise<Course | null> => {
  const result = await pool.query<Course>(
    'SELECT * FROM courses WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
};

export const findCoursesByInstructor = async (instructorId: string): Promise<Course[]> => {
  const result = await pool.query<Course>(
    'SELECT * FROM courses WHERE instructor_id = $1 ORDER BY created_at DESC',
    [instructorId]
  );
  return result.rows;
};

export const updateCourseStatus = async (
  id: string,
  status: 'draft' | 'published'
): Promise<Course> => {
  const result = await pool.query<Course>(
    `UPDATE courses SET status = $1, updated_at = NOW()
     WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows[0];
};

export const updateCourse = async (
  id: string,
  fields: Partial<Pick<Course, 'title' | 'description' | 'price'>>
): Promise<Course> => {
  const setClauses: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (fields.title !== undefined) {
    setClauses.push(`title = $${idx++}`);
    values.push(fields.title);
  }
  if (fields.description !== undefined) {
    setClauses.push(`description = $${idx++}`);
    values.push(fields.description);
  }
  if (fields.price !== undefined) {
    setClauses.push(`price = $${idx++}`);
    values.push(fields.price);
  }

  setClauses.push(`updated_at = NOW()`);
  values.push(id);

  const result = await pool.query<Course>(
    `UPDATE courses SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0];
};