import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { httpLogger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './modules/auth/auth.routes';
import coursesRoutes from './modules/courses/courses.routes';
import sessionsRoutes from './modules/sessions/sessions.routes';
import sessionsStandaloneRoutes from './modules/sessions/sessions.standalone.routes';
import enrollmentsRoutes from './modules/enrollments/enrollments.routes';
import payoutsRoutes from './modules/payouts/payouts.routes';

dotenv.config();

const app = express();

const allowedOrigins = new Set([
	'http://localhost:5173',
	'http://localhost:5174',
]);

app.use(cors({
	origin: (origin, callback) => {
		if (!origin || allowedOrigins.has(origin)) {
			callback(null, true);
			return;
		}
		callback(new Error(`Origin ${origin} not allowed by CORS`));
	},
  credentials: true,
}));

app.use(express.json());
app.use(httpLogger);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);

app.use('/courses', coursesRoutes);
app.use('/courses/:courseId/sessions', sessionsRoutes);

app.use('/sessions', sessionsStandaloneRoutes);
app.use('/payouts', payoutsRoutes);

app.use('/', enrollmentsRoutes);

app.use(errorHandler);

export default app;