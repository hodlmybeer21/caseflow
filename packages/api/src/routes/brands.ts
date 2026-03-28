import { Router } from 'express';
import { db } from '@caseflow/db';
import { brands } from '@caseflow/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, requireRole } from '../lib/auth.js';

export const brandsRouter = Router();

brandsRouter.use(requireAuth);

// GET /
brandsRouter.get('/', async (_req, res) => {
  try {
    const result = await db.select().from(brands);
    res.json(result);
  } catch (err) {
    console.error('List brands error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /
brandsRouter.post('/', requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { name, category } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Name required' });
      return;
    }

    const result = await db.insert(brands).values({ name, category }).returning();
    res.status(201).json(result[0]);
  } catch (err) {
    console.error('Create brand error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /:id
brandsRouter.patch('/:id', requireRole('admin', 'manager'), async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const { name, category } = req.body;

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (category !== undefined) updates.category = category;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    const result = await db.update(brands).set(updates).where(eq(brands.id, id)).returning();

    if (result.length === 0) {
      res.status(404).json({ error: 'Brand not found' });
      return;
    }

    res.json(result[0]);
  } catch (err) {
    console.error('Update brand error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /:id
brandsRouter.delete('/:id', requireRole('admin', 'manager'), async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    await db.delete(brands).where(eq(brands.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error('Delete brand error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
