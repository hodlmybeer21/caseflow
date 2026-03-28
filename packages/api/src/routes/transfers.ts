import { Router } from 'express';
import { db } from '@caseflow/db';
import { transfers, accountAssets, brands } from '@caseflow/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, requireRole } from '../lib/auth.js';

export const transfersRouter = Router();

transfersRouter.use(requireAuth);

// GET /
transfersRouter.get('/', async (_req, res) => {
  try {
    const result = await db
      .select({
        id: transfers.id,
        fromAccountId: transfers.fromAccountId,
        toAccountId: transfers.toAccountId,
        brandId: transfers.brandId,
        quantity: transfers.quantity,
        transferredAt: transfers.transferredAt,
        fromAccount: {
          id: accountAssets.id,
          assetType: accountAssets.assetType,
        },
        toAccount: {
          id: accountAssets.id,
          assetType: accountAssets.assetType,
        },
        brand: {
          id: brands.id,
          name: brands.name,
        },
      })
      .from(transfers)
      .leftJoin(accountAssets, eq(transfers.fromAccountId, accountAssets.id))
      .leftJoin(brands, eq(transfers.brandId, brands.id));

    res.json(result);
  } catch (err) {
    console.error('List transfers error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /
transfersRouter.post('/', requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { fromAccountId, toAccountId, brandId, quantity } = req.body;
    if (!brandId || quantity === undefined) {
      res.status(400).json({ error: 'brandId and quantity required' });
      return;
    }

    const result = await db.insert(transfers).values({
      fromAccountId: fromAccountId || null,
      toAccountId: toAccountId || null,
      brandId,
      quantity,
    }).returning();

    res.status(201).json(result[0]);
  } catch (err) {
    console.error('Create transfer error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
