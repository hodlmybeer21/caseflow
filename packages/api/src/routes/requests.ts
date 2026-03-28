import { Router } from 'express';
import { db } from '@caseflow/db';
import { posRequests, customers, brands } from '@caseflow/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, requireRole } from '../lib/auth.js';

export const requestsRouter = Router();

requestsRouter.use(requireAuth);

// GET /
requestsRouter.get('/', async (req, res) => {
  try {
    const { status } = req.query;

    // Filter by status if provided
    if (status) {
      const result = await db
        .select({
          id: posRequests.id,
          customerId: posRequests.customerId,
          brandId: posRequests.brandId,
          quantity: posRequests.quantity,
          status: posRequests.status,
          requestedAt: posRequests.requestedAt,
          customer: {
            id: customers.id,
            name: customers.name,
          },
          brand: {
            id: brands.id,
            name: brands.name,
          },
        })
        .from(posRequests)
        .leftJoin(customers, eq(posRequests.customerId, customers.id))
        .leftJoin(brands, eq(posRequests.brandId, brands.id))
        .where(eq(posRequests.status, status as 'pending' | 'approved' | 'fulfilled'));

      res.json(result);
      return;
    }

    const result = await db
      .select({
        id: posRequests.id,
        customerId: posRequests.customerId,
        brandId: posRequests.brandId,
        quantity: posRequests.quantity,
        status: posRequests.status,
        requestedAt: posRequests.requestedAt,
        customer: {
          id: customers.id,
          name: customers.name,
        },
        brand: {
          id: brands.id,
          name: brands.name,
        },
      })
      .from(posRequests)
      .leftJoin(customers, eq(posRequests.customerId, customers.id))
      .leftJoin(brands, eq(posRequests.brandId, brands.id));

    res.json(result);
  } catch (err) {
    console.error('List requests error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /
requestsRouter.post('/', requireRole('admin', 'manager', 'rep'), async (req, res) => {
  try {
    const { customerId, brandId, quantity } = req.body;
    if (!customerId || !brandId || !quantity) {
      res.status(400).json({ error: 'customerId, brandId, and quantity required' });
      return;
    }

    const result = await db.insert(posRequests).values({
      customerId,
      brandId,
      quantity,
      status: 'pending',
    }).returning();

    res.status(201).json(result[0]);
  } catch (err) {
    console.error('Create request error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /:id
requestsRouter.patch('/:id', requireRole('admin', 'manager'), async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const { status } = req.body;

    if (!status || !['pending', 'approved', 'fulfilled'].includes(status)) {
      res.status(400).json({ error: 'Valid status required (pending, approved, fulfilled)' });
      return;
    }

    const result = await db.update(posRequests).set({ status }).where(eq(posRequests.id, id)).returning();

    if (result.length === 0) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }

    res.json(result[0]);
  } catch (err) {
    console.error('Update request error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
