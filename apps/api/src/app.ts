import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/index.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { boardRouter } from './modules/boards/board.routes.js';

export function createApp(): express.Application {
  const app = express();

  // ─── Security & Parsing ─────────────────────────────────────────────────────
  app.use(helmet());
  app.use(cors({ origin: config.CLIENT_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '10kb' }));

  if (config.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // ─── Health Check ───────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ─── Routes ─────────────────────────────────────────────────────────────────
  app.use('/api/auth', authRouter);
  app.use('/api/boards', boardRouter);

  // ─── 404 + Error Handler ─────────────────────────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
