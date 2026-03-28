import { Router } from 'express';
import { db } from '@caseflow/db';
import { promoStaff } from '@caseflow/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, requireRole } from '../lib/auth.js';

export const promoStaffRouter = Router();

promoStaffRouter.use(requireAuth);

// GET /
promoStaffRouter.get('/', async (_req, res) => {
  try {
    const result = await db.select().from(promoStaff);
    res.json(result);
  } catch (err) {
    console.error('List promo staff error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /
promoStaffRouter.post('/', requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { name, eventId } = req.body;
    if (!name || !eventId) {
      res.status(400).json({ error: 'name and eventId required' });
      return;
    }

    const result = await db.insert(promoStaff).values({ name, eventId }).returning();
    res.status(201).json(result[0]);
  } catch (err) {
    console.error('Create promo staff error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /:id
promoStaffRouter.patch('/:id', requireRole('admin', 'manager'), async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const { name, active } = req.body;

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (active !== undefined) updates.active = active;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    const result = await db.update(promoStaff).set(updates).where(eq(promoStaff.id, id)).returning();

    if (result.length === 0) {
      res.status(404).json({ error: 'Promo staff not found' });
      return;
    }

    res.json(result[0]);
  } catch (err) {
    console.error('Update promo staff error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
