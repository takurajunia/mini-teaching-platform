import { pool } from '../../db';

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrolled_at: Date;
}

export interface EnrollmentWithCourse extends Enrollment {
  title: string;
  description: string;
  price: number;
  status: string;
  instructor_id: string;
}

export const createEnrollment = async (
  studentId: string,
  courseId: string
): Promise<Enrollment> => {
  const result = await pool.query<Enrollment>(
    `INSERT INTO enrollments (student_id, course_id)
     VALUES ($1, $2)
     RETURNING *`,
    [studentId, courseId]
  );
  return result.rows[0];
};

export const findEnrollment = async (
  studentId: string,
  courseId: string
): Promise<Enrollment | null> => {
  const result = await pool.query<Enrollment>(
    'SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2',
    [studentId, courseId]
  );
  return result.rows[0] || null;
};

export const findEnrollmentsByStudent = async (
  studentId: string
): Promise<EnrollmentWithCourse[]> => {
  const result = await pool.query<EnrollmentWithCourse>(
    `SELECT e.*, c.title, c.description, c.price, c.status, c.instructor_id
     FROM enrollments e
     JOIN courses c ON e.course_id = c.id
     WHERE e.student_id = $1
     ORDER BY e.enrolled_at DESC`,
    [studentId]
  );
  return result.rows;
};

export const countEnrollmentsByCourse = async (courseId: string): Promise<number> => {
  const result = await pool.query<{ count: string }>(
    'SELECT COUNT(*) FROM enrollments WHERE course_id = $1',
    [courseId]
  );
  return parseInt(result.rows[0].count, 10);
};