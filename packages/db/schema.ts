import { pgTable, text, timestamp, integer, boolean, varchar, pgEnum } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'manager', 'rep', 'staff']);
export const posStatusEnum = pgEnum('pos_status', ['pending', 'approved', 'fulfilled']);

// Users
export const users = pgTable('users', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull().default('staff'),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Customers
export const customers = pgTable('customers', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 255 }).notNull(),
  repUsername: varchar('rep_username', { length: 255 }),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Brands
export const brands = pgTable('brands', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Inventory
export const inventory = pgTable('inventory', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  brandId: integer('brand_id').notNull().references(() => brands.id),
  quantity: integer('quantity').notNull().default(0),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Events
export const events = pgTable('events', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  customerId: integer('customer_id').notNull().references(() => customers.id),
  eventType: varchar('event_type', { length: 255 }).notNull(),
  eventDate: timestamp('event_date').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Promo Staff
export const promoStaff = pgTable('promo_staff', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 255 }).notNull(),
  eventId: integer('event_id').notNull().references(() => events.id),
  active: boolean('active').default(true).notNull(),
});

// Account Assets
export const accountAssets = pgTable('account_assets', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  customerId: integer('customer_id').notNull().references(() => customers.id),
  brandId: integer('brand_id').notNull().references(() => brands.id),
  assetType: varchar('asset_type', { length: 255 }).notNull(),
  serialNumber: varchar('serial_number', { length: 255 }),
  placedDate: timestamp('placed_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Transfers
export const transfers = pgTable('transfers', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  fromAccountId: integer('from_account_id').references(() => accountAssets.id),
  toAccountId: integer('to_account_id').references(() => accountAssets.id),
  brandId: integer('brand_id').notNull().references(() => brands.id),
  quantity: integer('quantity').notNull(),
  transferredAt: timestamp('transferred_at').defaultNow().notNull(),
});

// POS Requests
export const posRequests = pgTable('pos_requests', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  customerId: integer('customer_id').notNull().references(() => customers.id),
  brandId: integer('brand_id').notNull().references(() => brands.id),
  quantity: integer('quantity').notNull(),
  status: posStatusEnum('status').default('pending').notNull(),
  requestedAt: timestamp('requested_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  // users can manage many customers
  customers: many(customers, { relationName: 'rep' }),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  rep: one(users, {
    fields: [customers.repUsername],
    references: [users.username],
    relationName: 'rep',
  }),
  events: many(events),
  accountAssets: many(accountAssets),
  posRequests: many(posRequests),
}));

export const brandsRelations = relations(brands, ({ many }) => ({
  inventory: many(inventory),
  accountAssets: many(accountAssets),
  transfers: many(transfers),
  posRequests: many(posRequests),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  brand: one(brands, {
    fields: [inventory.brandId],
    references: [brands.id],
  }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  customer: one(customers, {
    fields: [events.customerId],
    references: [customers.id],
  }),
  promoStaff: many(promoStaff),
}));

export const promoStaffRelations = relations(promoStaff, ({ one }) => ({
  event: one(events, {
    fields: [promoStaff.eventId],
    references: [events.id],
  }),
}));

export const accountAssetsRelations = relations(accountAssets, ({ one, many }) => ({
  customer: one(customers, {
    fields: [accountAssets.customerId],
    references: [customers.id],
  }),
  brand: one(brands, {
    fields: [accountAssets.brandId],
    references: [brands.id],
  }),
  transfersFrom: many(transfers, { relationName: 'fromAccount' }),
  transfersTo: many(transfers, { relationName: 'toAccount' }),
}));

export const transfersRelations = relations(transfers, ({ one }) => ({
  fromAccount: one(accountAssets, {
    fields: [transfers.fromAccountId],
    references: [accountAssets.id],
    relationName: 'fromAccount',
  }),
  toAccount: one(accountAssets, {
    fields: [transfers.toAccountId],
    references: [accountAssets.id],
    relationName: 'toAccount',
  }),
  brand: one(brands, {
    fields: [transfers.brandId],
    references: [brands.id],
  }),
}));

export const posRequestsRelations = relations(posRequests, ({ one }) => ({
  customer: one(customers, {
    fields: [posRequests.customerId],
    references: [customers.id],
  }),
  brand: one(brands, {
    fields: [posRequests.brandId],
    references: [brands.id],
  }),
}));
