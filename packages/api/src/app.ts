import express from 'express';
import path from 'path';
import fs from 'fs';
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

// Diagnostic — check what files exist at the static path
app.get('/debug/fs', (_req, res) => {
  const staticPath = '/app/packages/client/dist/public';
  try {
    const stat = fs.statSync(staticPath);
    const files = fs.readdirSync(staticPath);
    res.json({ path: staticPath, isDirectory: stat.isDirectory(), files });
  } catch (err: any) {
    res.json({ path: staticPath, error: err.message, code: err.code });
  }
});

// API routes
app.use('/api', apiRouter);

// Static files — use path.resolve to avoid esbuild process.cwd() issue
const STATIC_PATH = '/app/packages/client/dist/public';
app.use(express.static(STATIC_PATH));

// SPA fallback — serve React app for all non-API routes
app.get('*', (_req, res) => {
  const indexPath = path.join(STATIC_PATH, 'index.html');
  res.sendFile(indexPath);
});
