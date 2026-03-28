import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { apiRouter } from './routes/index.js';

export const app = express();

// Use cwd + relative path — Render's cwd is /opt/render/project/src
const STATIC_PATH = path.join(process.cwd(), 'packages/client/dist/public');

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
import { createReadStream } from 'fs';

app.get('/debug/fs', (_req, res) => {
  try {
    const stat = fs.statSync(STATIC_PATH);
    const files = fs.readdirSync(STATIC_PATH);
    res.json({ path: STATIC_PATH, isDirectory: stat.isDirectory(), files });
  } catch (err: any) {
    res.json({ path: STATIC_PATH, error: err.message, code: err.code });
  }
});

// Debug: find where git files actually are
app.get('/debug/paths', (_req, res) => {
  const candidates = [
    path.join(process.cwd(), 'packages/client/dist/public'),
    path.join(process.cwd(), 'artifacts/client/dist/public'),
    '/app/packages/client/dist/public',
    '/app/artifacts/client/dist/public',
  ];
  const results = {};
  for (const p of candidates) {
    try {
      const stat = fs.statSync(p);
      if (stat.isDirectory()) {
        results[p] = { exists: true, isDirectory: true, files: fs.readdirSync(p).slice(0, 5) };
      } else {
        results[p] = { exists: true, isFile: true };
      }
    } catch (err: any) {
      results[p] = { exists: false, error: err.code };
    }
  }
  // Also show current working directory and /app contents
  try { results['cwd'] = process.cwd(); } catch(e) { results['cwd'] = 'unavailable'; }
  try { results['/app'] = fs.readdirSync('/app').slice(0, 10); } catch(e) { results['/app'] = e.code; }
  try { results['~'] = fs.readdirSync(process.env.HOME || '/').slice(0, 10); } catch(e) { results['~'] = e.code; }
  res.json(results);
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
const indexFile = String(path.join(STATIC_PATH, 'index.html'));
app.get('/', (_req: any, res: any) => {
  if (fs.existsSync(indexFile)) {
    res.setHeader('Content-Type', 'text/html');
    fs.createReadStream(indexFile).pipe(res);
  } else {
    res.status(404).json({ error: 'static files not configured' });
  }
});
app.get('/{*path}', (req: any, res: any) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  if (fs.existsSync(indexFile)) {
    res.setHeader('Content-Type', 'text/html');
    fs.createReadStream(indexFile).pipe(res);
  } else {
    res.status(404).json({ error: 'static files not configured' });
  }
});
