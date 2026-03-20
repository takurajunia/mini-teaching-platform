import { pool } from '../../db';

export interface PayoutRequest {
  id: string;
  instructor_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: Date;
  resolved_at: Date | null;
  resolved_by: string | null;
}

export interface PayoutRequestWithSessions extends PayoutRequest {
  sessions: string[];
}

export const getUnpaidCompletedSessions = async (instructorId: string) => {
  const result = await pool.query(
    `SELECT s.* FROM sessions s
     WHERE s.instructor_id = $1
       AND s.status = 'completed'
       AND s.id NOT IN (
         SELECT prs.session_id FROM payout_request_sessions prs
         JOIN payout_requests pr ON prs.payout_request_id = pr.id
         WHERE pr.status IN ('pending', 'approved')
       )
     ORDER BY s.scheduled_at ASC`,
    [instructorId]
  );
  return result.rows;
};

export const getVirtualBalance = async (instructorId: string): Promise<number> => {
  const sessions = await getUnpaidCompletedSessions(instructorId);
  const result = await pool.query(
    `SELECT COALESCE(SUM(c.price), 0) as balance
     FROM sessions s
     JOIN courses c ON s.course_id = c.id
     WHERE s.id = ANY($1::uuid[])`,
    [sessions.map((s: any) => s.id)]
  );
  return parseFloat(result.rows[0].balance);
};

export const createPayoutRequest = async (
  instructorId: string,
  amount: number,
  sessionIds: string[]
): Promise<PayoutRequest> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const payoutResult = await client.query<PayoutRequest>(
      `INSERT INTO payout_requests (instructor_id, amount)
       VALUES ($1, $2) RETURNING *`,
      [instructorId, amount]
    );
    const payout = payoutResult.rows[0];

    for (const sessionId of sessionIds) {
      await client.query(
        `INSERT INTO payout_request_sessions (payout_request_id, session_id)
         VALUES ($1, $2)`,
        [payout.id, sessionId]
      );
    }

    await client.query('COMMIT');
    return payout;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const findPayoutsByInstructor = async (
  instructorId: string
): Promise<PayoutRequest[]> => {
  const result = await pool.query<PayoutRequest>(
    `SELECT * FROM payout_requests
     WHERE instructor_id = $1
     ORDER BY requested_at DESC`,
    [instructorId]
  );
  return result.rows;
};

export const findAllPayouts = async (filters: {
  instructorId?: string;
  status?: string;
}): Promise<PayoutRequest[]> => {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (filters.instructorId) {
    conditions.push(`instructor_id = $${idx++}`);
    values.push(filters.instructorId);
  }
  if (filters.status) {
    conditions.push(`status = $${idx++}`);
    values.push(filters.status);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await pool.query<PayoutRequest>(
    `SELECT * FROM payout_requests ${where} ORDER BY requested_at DESC`,
    values
  );
  return result.rows;
};

export const findPayoutById = async (id: string): Promise<PayoutRequest | null> => {
  const result = await pool.query<PayoutRequest>(
    'SELECT * FROM payout_requests WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
};

export const approvePayoutRequest = async (
  payoutId: string,
  adminId: string
): Promise<PayoutRequest> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query<PayoutRequest>(
      `UPDATE payout_requests
       SET status = 'approved', resolved_at = NOW(), resolved_by = $1
       WHERE id = $2 RETURNING *`,
      [adminId, payoutId]
    );

    // Mark all linked sessions as paid
    await client.query(
      `UPDATE sessions SET status = 'paid', updated_at = NOW()
       WHERE id IN (
         SELECT session_id FROM payout_request_sessions
         WHERE payout_request_id = $1
       )`,
      [payoutId]
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const rejectPayoutRequest = async (
  payoutId: string,
  adminId: string
): Promise<PayoutRequest> => {
  const result = await pool.query<PayoutRequest>(
    `UPDATE payout_requests
     SET status = 'rejected', resolved_at = NOW(), resolved_by = $1
     WHERE id = $2 RETURNING *`,
    [adminId, payoutId]
  );
  return result.rows[0];
};