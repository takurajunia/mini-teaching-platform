import app from './app';
import { pool } from './db';
import { log } from './utils/logger';

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await pool.query('SELECT 1');
    log.info('Database connected successfully');

    app.listen(PORT, () => {
      log.info(`Server running on port ${PORT}`);
    });
  } catch (err) {
    log.error('Failed to connect to database', { error: String(err) });
    process.exit(1);
  }
};

start();