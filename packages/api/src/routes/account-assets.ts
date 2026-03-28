import { Router } from 'express';
import { db } from '@caseflow/db';
import { accountAssets, customers, brands } from '@caseflow/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, requireRole } from '../lib/auth.js';

export const accountAssetsRouter = Router();

accountAssetsRouter.use(requireAuth);

// GET /
accountAssetsRouter.get('/', async (_req, res) => {
  try {
    const result = await db
      .select({
        id: accountAssets.id,
        customerId: accountAssets.customerId,
        brandId: accountAssets.brandId,
        assetType: accountAssets.assetType,
        serialNumber: accountAssets.serialNumber,
        placedDate: accountAssets.placedDate,
        createdAt: accountAssets.createdAt,
        customer: {
          id: customers.id,
          name: customers.name,
        },
        brand: {
          id: brands.id,
          name: brands.name,
        },
      })
      .from(accountAssets)
      .leftJoin(customers, eq(accountAssets.customerId, customers.id))
      .leftJoin(brands, eq(accountAssets.brandId, brands.id));

    res.json(result);
  } catch (err) {
    console.error('List account assets error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /
accountAssetsRouter.post('/', requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { customerId, brandId, assetType, serialNumber, placedDate } = req.body;
    if (!customerId || !brandId || !assetType) {
      res.status(400).json({ error: 'customerId, brandId, and assetType required' });
      return;
    }

    const result = await db.insert(accountAssets).values({
      customerId,
      brandId,
      assetType,
      serialNumber,
      placedDate: placedDate ? new Date(placedDate) : null,
    }).returning();

    res.status(201).json(result[0]);
  } catch (err) {
    console.error('Create account asset error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /:id
accountAssetsRouter.patch('/:id', requireRole('admin', 'manager'), async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const { assetType, serialNumber, placedDate } = req.body;

    const updates: Record<string, unknown> = {};
    if (assetType !== undefined) updates.assetType = assetType;
    if (serialNumber !== undefined) updates.serialNumber = serialNumber;
    if (placedDate !== undefined) updates.placedDate = new Date(placedDate);

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    const result = await db.update(accountAssets).set(updates).where(eq(accountAssets.id, id)).returning();

    if (result.length === 0) {
      res.status(404).json({ error: 'Account asset not found' });
      return;
    }

    res.json(result[0]);
  } catch (err) {
    console.error('Update account asset error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /:id
accountAssetsRouter.delete('/:id', requireRole('admin', 'manager'), async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    await db.delete(accountAssets).where(eq(accountAssets.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error('Delete account asset error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
