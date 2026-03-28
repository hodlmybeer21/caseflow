import { Router } from 'express';
import { db } from '@caseflow/db';
import { events, customers, promoStaff, accountAssets } from '@caseflow/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, requireRole } from '../lib/auth.js';

export const eventsRouter = Router();

eventsRouter.use(requireAuth);

// GET /
eventsRouter.get('/', async (_req, res) => {
  try {
    const result = await db
      .select({
        id: events.id,
        customerId: events.customerId,
        eventType: events.eventType,
        eventDate: events.eventDate,
        notes: events.notes,
        createdAt: events.createdAt,
        customer: {
          id: customers.id,
          name: customers.name,
        },
      })
      .from(events)
      .leftJoin(customers, eq(events.customerId, customers.id));

    res.json(result);
  } catch (err) {
    console.error('List events error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /
eventsRouter.post('/', requireRole('admin', 'manager', 'rep'), async (req, res) => {
  try {
    const { customerId, eventType, eventDate, notes } = req.body;
    if (!customerId || !eventType || !eventDate) {
      res.status(400).json({ error: 'customerId, eventType, and eventDate required' });
      return;
    }

    const result = await db.insert(events).values({
      customerId,
      eventType,
      eventDate: new Date(eventDate),
      notes,
    }).returning();

    res.status(201).json(result[0]);
  } catch (err) {
    console.error('Create event error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /:id
eventsRouter.patch('/:id', requireRole('admin', 'manager', 'rep'), async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const { eventType, eventDate, notes } = req.body;

    const updates: Record<string, unknown> = {};
    if (eventType !== undefined) updates.eventType = eventType;
    if (eventDate !== undefined) updates.eventDate = new Date(eventDate);
    if (notes !== undefined) updates.notes = notes;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    const result = await db.update(events).set(updates).where(eq(events.id, id)).returning();

    if (result.length === 0) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    res.json(result[0]);
  } catch (err) {
    console.error('Update event error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /:id/report
eventsRouter.get('/:id/report', requireRole('admin', 'manager', 'rep'), async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);

    // Get event with customer
    const eventResult = await db
      .select({
        id: events.id,
        eventType: events.eventType,
        eventDate: events.eventDate,
        notes: events.notes,
        customer: customers.name,
      })
      .from(events)
      .leftJoin(customers, eq(events.customerId, customers.id))
      .where(eq(events.id, id))
      .limit(1);

    if (eventResult.length === 0) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    // Get promo staff for this event
    const staffResult = await db
      .select()
      .from(promoStaff)
      .where(eq(promoStaff.eventId, id));

    // Get account assets placed at this event
    const assetsResult = await db
      .select({
        id: accountAssets.id,
        assetType: accountAssets.assetType,
        serialNumber: accountAssets.serialNumber,
        placedDate: accountAssets.placedDate,
      })
      .from(accountAssets)
      .where(eq(accountAssets.customerId, eventResult[0].customerId));

    res.json({
      event: eventResult[0],
      promoStaff: staffResult,
      assets: assetsResult,
    });
  } catch (err) {
    console.error('Event report error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
