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
    // Get all transfers with from/to account info and brand
    const allTransfers = await db
      .select({
        id: transfers.id,
        fromAccountId: transfers.fromAccountId,
        toAccountId: transfers.toAccountId,
        brandId: transfers.brandId,
        quantity: transfers.quantity,
        transferredAt: transfers.transferredAt,
      })
      .from(transfers);

    // Enrich with account and brand details
    const enriched = await Promise.all(
      allTransfers.map(async (t) => {
        let fromAccount = null;
        let toAccount = null;
        let brand = null;

        if (t.fromAccountId) {
          const [fa] = await db
            .select({ id: accountAssets.id, assetType: accountAssets.assetType })
            .from(accountAssets)
            .where(eq(accountAssets.id, t.fromAccountId))
            .limit(1);
          fromAccount = fa || null;
        }

        if (t.toAccountId) {
          const [ta] = await db
            .select({ id: accountAssets.id, assetType: accountAssets.assetType })
            .from(accountAssets)
            .where(eq(accountAssets.id, t.toAccountId))
            .limit(1);
          toAccount = ta || null;
        }

        if (t.brandId) {
          const [b] = await db
            .select({ id: brands.id, name: brands.name })
            .from(brands)
            .where(eq(brands.id, t.brandId))
            .limit(1);
          brand = b || null;
        }

        return { ...t, fromAccount, toAccount, brand };
      })
    );

    res.json(enriched);
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
