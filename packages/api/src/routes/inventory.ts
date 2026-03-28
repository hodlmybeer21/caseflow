import { Router } from 'express';
import { db } from '@caseflow/db';
import { inventory, brands } from '@caseflow/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, requireRole } from '../lib/auth.js';

export const inventoryRouter = Router();

inventoryRouter.use(requireAuth);

// GET /
inventoryRouter.get('/', async (_req, res) => {
  try {
    const result = await db
      .select({
        id: inventory.id,
        brandId: inventory.brandId,
        quantity: inventory.quantity,
        updatedAt: inventory.updatedAt,
        brand: {
          id: brands.id,
          name: brands.name,
          category: brands.category,
        },
      })
      .from(inventory)
      .leftJoin(brands, eq(inventory.brandId, brands.id));

    res.json(result);
  } catch (err) {
    console.error('List inventory error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /
inventoryRouter.post('/', requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { brandId, quantity } = req.body;
    if (!brandId || quantity === undefined) {
      res.status(400).json({ error: 'brandId and quantity required' });
      return;
    }

    const result = await db.insert(inventory).values({ brandId, quantity }).returning();
    res.status(201).json(result[0]);
  } catch (err) {
    console.error('Create inventory error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /:id
inventoryRouter.patch('/:id', requireRole('admin', 'manager'), async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const { quantity } = req.body;

    if (quantity === undefined) {
      res.status(400).json({ error: 'quantity required' });
      return;
    }

    const result = await db
      .update(inventory)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(inventory.id, id))
      .returning();

    if (result.length === 0) {
      res.status(404).json({ error: 'Inventory not found' });
      return;
    }

    res.json(result[0]);
  } catch (err) {
    console.error('Update inventory error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
