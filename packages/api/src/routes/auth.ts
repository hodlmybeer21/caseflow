import { Router } from 'express';
import { db } from '@caseflow/db';
import { users } from '@caseflow/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, verifyPassword, resetTokens, requireAuth } from '../lib/auth.js';
import { randomUUID } from 'crypto';

export const authRouter = Router();

// POST /api/auth/seed — create first admin user (no auth required, call once)
authRouter.post('/seed', async (req, res) => {
  try {
    const { username, password, displayName, email } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: 'username and password required' });
      return;
    }
    const passwordHash = await hashPassword(password);
    const [user] = await db.insert(users).values({
      username,
      passwordHash,
      displayName: displayName || username,
      email: email || `${username}@caseflow.local`,
      role: 'admin',
    }).returning();
    res.json({ message: 'Admin user created', userId: user.id });
  } catch (err: any) {
    if (err.code === '23505') {
      res.status(409).json({ error: 'User already exists' });
    } else {
      console.error('Seed error:', err);
      res.status(500).json({ error: err.message });
    }
  }
});

// POST /login
authRouter.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password required' });
      return;
    }

    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    const user = result[0];

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      displayName: user.displayName,
    };

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /logout
authRouter.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: 'Logout failed' });
      return;
    }
    res.json({ success: true });
  });
});

// GET /me
authRouter.get('/me', requireAuth, (req, res) => {
  res.json(req.session.user);
});

// POST /forgot-password
authRouter.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email required' });
      return;
    }

    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = result[0];

    if (!user) {
      // Don't reveal if user exists
      res.json({ message: 'If that email exists, a reset token has been sent' });
      return;
    }

    const token = randomUUID();
    const expires = Date.now() + 60 * 60 * 1000; // 1 hour
    resetTokens.set(token, { userId: user.id, expires });

    // In production: send email with reset link
    console.log(`Reset token for ${email}: ${token}`);

    res.json({ message: 'If that email exists, a reset token has been sent' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /reset-password
authRouter.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      res.status(400).json({ error: 'Token and password required' });
      return;
    }

    const tokenData = resetTokens.get(token);
    if (!tokenData || tokenData.expires < Date.now()) {
      res.status(400).json({ error: 'Invalid or expired token' });
      resetTokens.delete(token);
      return;
    }

    const passwordHash = await hashPassword(password);
    await db.update(users).set({ passwordHash }).where(eq(users.id, tokenData.userId));
    resetTokens.delete(token);

    res.json({ success: true });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
