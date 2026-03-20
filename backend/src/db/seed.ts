import bcrypt from 'bcryptjs';
import { pool } from './index';
import { log } from '../utils/logger';

const seed = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Clear existing data in correct order
    await client.query('DELETE FROM payout_request_sessions');
    await client.query('DELETE FROM payout_requests');
    await client.query('DELETE FROM sessions');
    await client.query('DELETE FROM enrollments');
    await client.query('DELETE FROM courses');
    await client.query('DELETE FROM users');

    const password = await bcrypt.hash('password123', 10);

    // Seed users
    const adminResult = await client.query(`
      INSERT INTO users (email, password_hash, role, type)
      VALUES ('admin@minilearning.com', $1, 'admin', NULL)
      RETURNING id
    `, [password]);

    const instructor1Result = await client.query(`
      INSERT INTO users (email, password_hash, role, type)
      VALUES ('instructor1@minilearning.com', $1, 'user', 'instructor')
      RETURNING id
    `, [password]);

    const instructor2Result = await client.query(`
      INSERT INTO users (email, password_hash, role, type)
      VALUES ('instructor2@minilearning.com', $1, 'user', 'instructor')
      RETURNING id
    `, [password]);

    const student1Result = await client.query(`
      INSERT INTO users (email, password_hash, role, type)
      VALUES ('student1@minilearning.com', $1, 'user', 'student')
      RETURNING id
    `, [password]);

    const student2Result = await client.query(`
      INSERT INTO users (email, password_hash, role, type)
      VALUES ('student2@minilearning.com', $1, 'user', 'student')
      RETURNING id
    `, [password]);

    const instructorId1 = instructor1Result.rows[0].id;
    const instructorId2 = instructor2Result.rows[0].id;
    const studentId1 = student1Result.rows[0].id;
    const studentId2 = student2Result.rows[0].id;

    // Seed courses
    const course1Result = await client.query(`
      INSERT INTO courses (instructor_id, title, description, price, status)
      VALUES ($1, 'Introduction to TypeScript', 'Learn TypeScript from scratch', 49.99, 'published')
      RETURNING id
    `, [instructorId1]);

    const course2Result = await client.query(`
      INSERT INTO courses (instructor_id, title, description, price, status)
      VALUES ($1, 'Advanced Node.js', 'Deep dive into Node.js internals', 79.99, 'published')
      RETURNING id
    `, [instructorId1]);

    const course3Result = await client.query(`
      INSERT INTO courses (instructor_id, title, description, price, status)
      VALUES ($1, 'React for Beginners', 'Build modern UIs with React', 39.99, 'draft')
      RETURNING id
    `, [instructorId2]);

    const courseId1 = course1Result.rows[0].id;
    const courseId2 = course2Result.rows[0].id;
    const courseId3 = course3Result.rows[0].id;

    // Seed enrollments
    await client.query(`
      INSERT INTO enrollments (student_id, course_id)
      VALUES ($1, $2)
    `, [studentId1, courseId1]);

    await client.query(`
      INSERT INTO enrollments (student_id, course_id)
      VALUES ($1, $2)
    `, [studentId1, courseId2]);

    await client.query(`
      INSERT INTO enrollments (student_id, course_id)
      VALUES ($1, $2)
    `, [studentId2, courseId1]);

    // Seed sessions
    const session1Result = await client.query(`
      INSERT INTO sessions (course_id, instructor_id, title, scheduled_at, duration_minutes, status)
      VALUES ($1, $2, 'TS Basics - Week 1', NOW() - INTERVAL '7 days', 60, 'completed')
      RETURNING id
    `, [courseId1, instructorId1]);

    const session2Result = await client.query(`
      INSERT INTO sessions (course_id, instructor_id, title, scheduled_at, duration_minutes, status)
      VALUES ($1, $2, 'TS Basics - Week 2', NOW() - INTERVAL '3 days', 60, 'completed')
      RETURNING id
    `, [courseId1, instructorId1]);

    await client.query(`
      INSERT INTO sessions (course_id, instructor_id, title, scheduled_at, duration_minutes, status)
      VALUES ($1, $2, 'TS Basics - Week 3', NOW() + INTERVAL '4 days', 60, 'scheduled')
    `, [courseId1, instructorId1]);

    await client.query(`
      INSERT INTO sessions (course_id, instructor_id, title, scheduled_at, duration_minutes, status)
      VALUES ($1, $2, 'Node.js Event Loop', NOW() + INTERVAL '2 days', 90, 'scheduled')
    `, [courseId2, instructorId1]);

    await client.query(`
      INSERT INTO sessions (course_id, instructor_id, title, scheduled_at, duration_minutes, status)
      VALUES ($1, $2, 'React Components', NOW() + INTERVAL '5 days', 60, 'scheduled')
    `, [courseId3, instructorId2]);

    // Seed a payout request using completed sessions
    const sessionId1 = session1Result.rows[0].id;
    const sessionId2 = session2Result.rows[0].id;

    const payoutResult = await client.query(`
      INSERT INTO payout_requests (instructor_id, amount, status)
      VALUES ($1, 99.98, 'pending')
      RETURNING id
    `, [instructorId1]);

    const payoutId = payoutResult.rows[0].id;

    await client.query(`
      INSERT INTO payout_request_sessions (payout_request_id, session_id)
      VALUES ($1, $2), ($1, $3)
    `, [payoutId, sessionId1, sessionId2]);

    await client.query('COMMIT');

    log.info('Seed completed successfully');
    log.info('--- Seeded Accounts (password: password123) ---');
    log.info(`Admin:       admin@minilearning.com`);
    log.info(`Instructor1: instructor1@minilearning.com`);
    log.info(`Instructor2: instructor2@minilearning.com`);
    log.info(`Student1:    student1@minilearning.com`);
    log.info(`Student2:    student2@minilearning.com`);

  } catch (err) {
    await client.query('ROLLBACK');
    log.error('Seed failed', { error: String(err) });
    throw err;
  } finally {
    client.release();
  }
};

seed().then(() => {
  pool.end();
  process.exit(0);
}).catch(() => process.exit(1));