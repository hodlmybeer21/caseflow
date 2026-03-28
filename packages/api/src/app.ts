import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { apiRouter } from './routes/index.js';

export const app = express();

const STATIC_PATH = '/app/packages/client/dist/public';

// CORS
app.use(cors({ origin: true, credentials: true }));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookies
app.use(cookieParser());

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'caseflow-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Diagnostic endpoint
app.get('/debug/fs', (_req, res) => {
  try {
    const stat = fs.statSync(STATIC_PATH);
    const files = fs.readdirSync(STATIC_PATH);
    res.json({ path: STATIC_PATH, isDirectory: stat.isDirectory(), files });
  } catch (err: any) {
    res.json({ path: STATIC_PATH, error: err.message, code: err.code });
  }
});

// Startup diagnostic
try {
  const files = fs.readdirSync(STATIC_PATH);
  console.log(`[OK] Static files at ${STATIC_PATH}: ${files.join(', ')}`);
} catch (err: any) {
  console.error(`[WARN] Static files not found at ${STATIC_PATH}: ${err.message}`);
}

// API routes FIRST
app.use('/api', apiRouter);

// Static files
app.use(express.static(STATIC_PATH));

// SPA fallback — serve React app for all non-API, non-static routes
// Use /{*path} Express 5 wildcard syntax (NOT bare "*")
const indexFile = path.join(STATIC_PATH, 'index.html');
app.get('/{*path}', (req, res) => {
  // Skip API routes — they are handled by the apiRouter above
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  if (fs.existsSync(indexFile)) {
    res.sendFile(indexFile);
  } else {
    res.status(404).json({ error: 'static files not configured' });
  }
});
