import { Router } from 'express';
import { db } from '@caseflow/db';
import { users } from '@caseflow/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, requireRole, hashPassword } from '../lib/auth.js';

export const usersRouter = Router();

usersRouter.use(requireAuth, requireRole('admin'));

// GET /
usersRouter.get('/', async (_req, res) => {
  try {
    const result = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      displayName: users.displayName,
      createdAt: users.createdAt,
    }).from(users);
    res.json(result);
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /
usersRouter.post('/', async (req, res) => {
  try {
    const { username, email, password, role, displayName } = req.body;
    if (!username || !email || !password || !displayName) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const passwordHash = await hashPassword(password);
    const result = await db.insert(users).values({
      username,
      email,
      passwordHash,
      role: role || 'staff',
      displayName,
    }).returning({ id: users.id });

    res.status(201).json(result[0]);
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /:id
usersRouter.patch('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const { email, role, displayName } = req.body;

    const updates: Record<string, unknown> = {};
    if (email !== undefined) updates.email = email;
    if (role !== undefined) updates.role = role;
    if (displayName !== undefined) updates.displayName = displayName;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      displayName: users.displayName,
    });

    if (result.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(result[0]);
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /:id
usersRouter.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    await db.delete(users).where(eq(users.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
