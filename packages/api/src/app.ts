import express from 'express';
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

// Static files from absolute path (process.cwd() broken in esbuild bundle)
app.use(express.static('/app/artifacts/client/dist/public'));

// SPA fallback - catchall for non-API routes
app.use((_req, res) => {
  res.sendFile('/app/artifacts/client/dist/public/index.html');
});
