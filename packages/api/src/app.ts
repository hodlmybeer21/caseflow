import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { apiRouter } from './routes/index.js';

export const app = express();

// CORS
app.use(cors({ origin: true, credentials: true }));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookies
app.use(cookieParser());

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'caseflow-dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/api', apiRouter);

// Static files — use path.resolve to avoid esbuild process.cwd() issue
const STATIC_PATH = '/app/packages/client/dist/public';
app.use(express.static(STATIC_PATH));

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(STATIC_PATH, 'index.html'), (err) => {
    if (err) {
      console.error('sendFile error:', err.message);
      res.status(404).json({ error: 'static file not found', path: STATIC_PATH });
    }
  });
});
