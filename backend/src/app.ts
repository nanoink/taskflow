import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { apiRouter } from './routes/index.js';

export const app = express();

app.disable('x-powered-by');
app.use(cors({ origin: env.FRONTEND_URL }));
app.use(express.json({ limit: '32kb' }));
app.use('/api', apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);
