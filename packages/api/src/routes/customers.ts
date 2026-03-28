import { Router } from 'express';
import { db } from '@caseflow/db';
import { customers } from '@caseflow/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth, requireRole } from '../lib/auth.js';

export const customersRouter = Router();

customersRouter.use(requireAuth);

// GET /
customersRouter.get('/', async (req, res) => {
  try {
    const { active } = req.query;

    // Reps can only see their assigned customers
    if (req.session.user?.role === 'rep') {
      const result = await db.select().from(customers).where(
        eq(customers.repUsername, req.session.user!.username)
      );
      res.json(result);
      return;
    }

    let result;
    if (active !== undefined) {
      result = await db.select().from(customers).where(
        eq(customers.active, active === 'true')
      );
    } else {
      result = await db.select().from(customers);
    }
    res.json(result);
  } catch (err) {
    console.error('List customers error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /
customersRouter.post('/', requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { name, repUsername } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Name required' });
      return;
    }

    const result = await db.insert(customers).values({
      name,
      repUsername: repUsername || null,
      active: true,
    }).returning();

    res.status(201).json(result[0]);
  } catch (err) {
    console.error('Create customer error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /:id
customersRouter.patch('/:id', requireRole('admin', 'manager'), async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const { name, repUsername, active } = req.body;

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (repUsername !== undefined) updates.repUsername = repUsername;
    if (active !== undefined) updates.active = active;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    const result = await db.update(customers).set(updates).where(eq(customers.id, id)).returning();

    if (result.length === 0) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    res.json(result[0]);
  } catch (err) {
    console.error('Update customer error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /:id
customersRouter.delete('/:id', requireRole('admin', 'manager'), async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    // Soft delete - set active to false
    await db.update(customers).set({ active: false }).where(eq(customers.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error('Delete customer error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
