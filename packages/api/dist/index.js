var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/index.ts
import "dotenv/config";
import { createServer } from "http";

// src/app.ts
import express from "express";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";

// src/routes/index.ts
import { Router as Router11 } from "express";

// src/routes/auth.ts
import { Router } from "express";

// ../db/connection.ts
import { drizzle } from "drizzle-orm/neon-http";

// ../db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  accountAssets: () => accountAssets,
  accountAssetsRelations: () => accountAssetsRelations,
  brands: () => brands,
  brandsRelations: () => brandsRelations,
  customers: () => customers,
  customersRelations: () => customersRelations,
  events: () => events,
  eventsRelations: () => eventsRelations,
  inventory: () => inventory,
  inventoryRelations: () => inventoryRelations,
  posRequests: () => posRequests,
  posRequestsRelations: () => posRequestsRelations,
  posStatusEnum: () => posStatusEnum,
  promoStaff: () => promoStaff,
  promoStaffRelations: () => promoStaffRelations,
  transfers: () => transfers,
  transfersRelations: () => transfersRelations,
  userRoleEnum: () => userRoleEnum,
  users: () => users,
  usersRelations: () => usersRelations
});
import { pgTable, text, timestamp, integer, boolean, varchar, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
var userRoleEnum = pgEnum("user_role", ["admin", "manager", "rep", "staff"]);
var posStatusEnum = pgEnum("pos_status", ["pending", "approved", "fulfilled"]);
var users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("staff"),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var customers = pgTable("customers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  repUsername: varchar("rep_username", { length: 255 }),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var brands = pgTable("brands", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var inventory = pgTable("inventory", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  brandId: integer("brand_id").notNull().references(() => brands.id),
  quantity: integer("quantity").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var events = pgTable("events", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  eventType: varchar("event_type", { length: 255 }).notNull(),
  eventDate: timestamp("event_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var promoStaff = pgTable("promo_staff", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  eventId: integer("event_id").notNull().references(() => events.id),
  active: boolean("active").default(true).notNull()
});
var accountAssets = pgTable("account_assets", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  brandId: integer("brand_id").notNull().references(() => brands.id),
  assetType: varchar("asset_type", { length: 255 }).notNull(),
  serialNumber: varchar("serial_number", { length: 255 }),
  placedDate: timestamp("placed_date"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var transfers = pgTable("transfers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  fromAccountId: integer("from_account_id").references(() => accountAssets.id),
  toAccountId: integer("to_account_id").references(() => accountAssets.id),
  brandId: integer("brand_id").notNull().references(() => brands.id),
  quantity: integer("quantity").notNull(),
  transferredAt: timestamp("transferred_at").defaultNow().notNull()
});
var posRequests = pgTable("pos_requests", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  brandId: integer("brand_id").notNull().references(() => brands.id),
  quantity: integer("quantity").notNull(),
  status: posStatusEnum("status").default("pending").notNull(),
  requestedAt: timestamp("requested_at").defaultNow().notNull()
});
var usersRelations = relations(users, ({ many }) => ({
  // users can manage many customers
  customers: many(customers, { relationName: "rep" })
}));
var customersRelations = relations(customers, ({ one, many }) => ({
  rep: one(users, {
    fields: [customers.repUsername],
    references: [users.username],
    relationName: "rep"
  }),
  events: many(events),
  accountAssets: many(accountAssets),
  posRequests: many(posRequests)
}));
var brandsRelations = relations(brands, ({ many }) => ({
  inventory: many(inventory),
  accountAssets: many(accountAssets),
  transfers: many(transfers),
  posRequests: many(posRequests)
}));
var inventoryRelations = relations(inventory, ({ one }) => ({
  brand: one(brands, {
    fields: [inventory.brandId],
    references: [brands.id]
  })
}));
var eventsRelations = relations(events, ({ one, many }) => ({
  customer: one(customers, {
    fields: [events.customerId],
    references: [customers.id]
  }),
  promoStaff: many(promoStaff)
}));
var promoStaffRelations = relations(promoStaff, ({ one }) => ({
  event: one(events, {
    fields: [promoStaff.eventId],
    references: [events.id]
  })
}));
var accountAssetsRelations = relations(accountAssets, ({ one, many }) => ({
  customer: one(customers, {
    fields: [accountAssets.customerId],
    references: [customers.id]
  }),
  brand: one(brands, {
    fields: [accountAssets.brandId],
    references: [brands.id]
  }),
  transfersFrom: many(transfers, { relationName: "fromAccount" }),
  transfersTo: many(transfers, { relationName: "toAccount" })
}));
var transfersRelations = relations(transfers, ({ one }) => ({
  fromAccount: one(accountAssets, {
    fields: [transfers.fromAccountId],
    references: [accountAssets.id],
    relationName: "fromAccount"
  }),
  toAccount: one(accountAssets, {
    fields: [transfers.toAccountId],
    references: [accountAssets.id],
    relationName: "toAccount"
  }),
  brand: one(brands, {
    fields: [transfers.brandId],
    references: [brands.id]
  })
}));
var posRequestsRelations = relations(posRequests, ({ one }) => ({
  customer: one(customers, {
    fields: [posRequests.customerId],
    references: [customers.id]
  }),
  brand: one(brands, {
    fields: [posRequests.brandId],
    references: [brands.id]
  })
}));

// ../db/connection.ts
import "dotenv/config";
var databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL environment variable is required");
var db = drizzle(databaseUrl, { schema: schema_exports });

// src/routes/auth.ts
import { eq } from "drizzle-orm";

// src/lib/auth.ts
import bcrypt from "bcryptjs";
var resetTokens = /* @__PURE__ */ new Map();
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
function requireAuth(req, res, next) {
  if (!req.session.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!roles.includes(req.session.user.role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}

// src/routes/auth.ts
import { randomUUID } from "crypto";
var authRouter = Router();
authRouter.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: "Username and password required" });
      return;
    }
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    const user = result[0];
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      displayName: user.displayName
    };
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      displayName: user.displayName
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
authRouter.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: "Logout failed" });
      return;
    }
    res.json({ success: true });
  });
});
authRouter.get("/me", requireAuth, (req, res) => {
  res.json(req.session.user);
});
authRouter.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "Email required" });
      return;
    }
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = result[0];
    if (!user) {
      res.json({ message: "If that email exists, a reset token has been sent" });
      return;
    }
    const token = randomUUID();
    const expires = Date.now() + 60 * 60 * 1e3;
    resetTokens.set(token, { userId: user.id, expires });
    console.log(`Reset token for ${email}: ${token}`);
    res.json({ message: "If that email exists, a reset token has been sent" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
authRouter.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      res.status(400).json({ error: "Token and password required" });
      return;
    }
    const tokenData = resetTokens.get(token);
    if (!tokenData || tokenData.expires < Date.now()) {
      res.status(400).json({ error: "Invalid or expired token" });
      resetTokens.delete(token);
      return;
    }
    const passwordHash = await hashPassword(password);
    await db.update(users).set({ passwordHash }).where(eq(users.id, tokenData.userId));
    resetTokens.delete(token);
    res.json({ success: true });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// src/routes/users.ts
import { Router as Router2 } from "express";
import { eq as eq2 } from "drizzle-orm";
var usersRouter = Router2();
usersRouter.use(requireAuth, requireRole("admin"));
usersRouter.get("/", async (_req, res) => {
  try {
    const result = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      displayName: users.displayName,
      createdAt: users.createdAt
    }).from(users);
    res.json(result);
  } catch (err) {
    console.error("List users error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
usersRouter.post("/", async (req, res) => {
  try {
    const { username, email, password, role, displayName } = req.body;
    if (!username || !email || !password || !displayName) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const passwordHash = await hashPassword(password);
    const result = await db.insert(users).values({
      username,
      email,
      passwordHash,
      role: role || "staff",
      displayName
    }).returning({ id: users.id });
    res.status(201).json(result[0]);
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
usersRouter.patch("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { email, role, displayName } = req.body;
    const updates = {};
    if (email !== void 0) updates.email = email;
    if (role !== void 0) updates.role = role;
    if (displayName !== void 0) updates.displayName = displayName;
    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "No fields to update" });
      return;
    }
    const result = await db.update(users).set(updates).where(eq2(users.id, id)).returning({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      displayName: users.displayName
    });
    if (result.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(result[0]);
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
usersRouter.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(users).where(eq2(users.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// src/routes/customers.ts
import { Router as Router3 } from "express";
import { eq as eq3 } from "drizzle-orm";
var customersRouter = Router3();
customersRouter.use(requireAuth);
customersRouter.get("/", async (req, res) => {
  try {
    const { active } = req.query;
    if (req.session.user?.role === "rep") {
      const result2 = await db.select().from(customers).where(
        eq3(customers.repUsername, req.session.user.username)
      );
      res.json(result2);
      return;
    }
    let result;
    if (active !== void 0) {
      result = await db.select().from(customers).where(
        eq3(customers.active, active === "true")
      );
    } else {
      result = await db.select().from(customers);
    }
    res.json(result);
  } catch (err) {
    console.error("List customers error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
customersRouter.post("/", requireRole("admin", "manager"), async (req, res) => {
  try {
    const { name, repUsername } = req.body;
    if (!name) {
      res.status(400).json({ error: "Name required" });
      return;
    }
    const result = await db.insert(customers).values({
      name,
      repUsername: repUsername || null,
      active: true
    }).returning();
    res.status(201).json(result[0]);
  } catch (err) {
    console.error("Create customer error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
customersRouter.patch("/:id", requireRole("admin", "manager"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, repUsername, active } = req.body;
    const updates = {};
    if (name !== void 0) updates.name = name;
    if (repUsername !== void 0) updates.repUsername = repUsername;
    if (active !== void 0) updates.active = active;
    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "No fields to update" });
      return;
    }
    const result = await db.update(customers).set(updates).where(eq3(customers.id, id)).returning();
    if (result.length === 0) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }
    res.json(result[0]);
  } catch (err) {
    console.error("Update customer error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
customersRouter.delete("/:id", requireRole("admin", "manager"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.update(customers).set({ active: false }).where(eq3(customers.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error("Delete customer error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// src/routes/brands.ts
import { Router as Router4 } from "express";
import { eq as eq4 } from "drizzle-orm";
var brandsRouter = Router4();
brandsRouter.use(requireAuth);
brandsRouter.get("/", async (_req, res) => {
  try {
    const result = await db.select().from(brands);
    res.json(result);
  } catch (err) {
    console.error("List brands error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
brandsRouter.post("/", requireRole("admin", "manager"), async (req, res) => {
  try {
    const { name, category } = req.body;
    if (!name) {
      res.status(400).json({ error: "Name required" });
      return;
    }
    const result = await db.insert(brands).values({ name, category }).returning();
    res.status(201).json(result[0]);
  } catch (err) {
    console.error("Create brand error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
brandsRouter.patch("/:id", requireRole("admin", "manager"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, category } = req.body;
    const updates = {};
    if (name !== void 0) updates.name = name;
    if (category !== void 0) updates.category = category;
    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "No fields to update" });
      return;
    }
    const result = await db.update(brands).set(updates).where(eq4(brands.id, id)).returning();
    if (result.length === 0) {
      res.status(404).json({ error: "Brand not found" });
      return;
    }
    res.json(result[0]);
  } catch (err) {
    console.error("Update brand error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
brandsRouter.delete("/:id", requireRole("admin", "manager"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(brands).where(eq4(brands.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error("Delete brand error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// src/routes/inventory.ts
import { Router as Router5 } from "express";
import { eq as eq5 } from "drizzle-orm";
var inventoryRouter = Router5();
inventoryRouter.use(requireAuth);
inventoryRouter.get("/", async (_req, res) => {
  try {
    const result = await db.select({
      id: inventory.id,
      brandId: inventory.brandId,
      quantity: inventory.quantity,
      updatedAt: inventory.updatedAt,
      brand: {
        id: brands.id,
        name: brands.name,
        category: brands.category
      }
    }).from(inventory).leftJoin(brands, eq5(inventory.brandId, brands.id));
    res.json(result);
  } catch (err) {
    console.error("List inventory error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
inventoryRouter.post("/", requireRole("admin", "manager"), async (req, res) => {
  try {
    const { brandId, quantity } = req.body;
    if (!brandId || quantity === void 0) {
      res.status(400).json({ error: "brandId and quantity required" });
      return;
    }
    const result = await db.insert(inventory).values({ brandId, quantity }).returning();
    res.status(201).json(result[0]);
  } catch (err) {
    console.error("Create inventory error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
inventoryRouter.patch("/:id", requireRole("admin", "manager"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { quantity } = req.body;
    if (quantity === void 0) {
      res.status(400).json({ error: "quantity required" });
      return;
    }
    const result = await db.update(inventory).set({ quantity, updatedAt: /* @__PURE__ */ new Date() }).where(eq5(inventory.id, id)).returning();
    if (result.length === 0) {
      res.status(404).json({ error: "Inventory not found" });
      return;
    }
    res.json(result[0]);
  } catch (err) {
    console.error("Update inventory error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// src/routes/events.ts
import { Router as Router6 } from "express";
import { eq as eq6 } from "drizzle-orm";
var eventsRouter = Router6();
eventsRouter.use(requireAuth);
eventsRouter.get("/", async (_req, res) => {
  try {
    const result = await db.select({
      id: events.id,
      customerId: events.customerId,
      eventType: events.eventType,
      eventDate: events.eventDate,
      notes: events.notes,
      createdAt: events.createdAt,
      customer: {
        id: customers.id,
        name: customers.name
      }
    }).from(events).leftJoin(customers, eq6(events.customerId, customers.id));
    res.json(result);
  } catch (err) {
    console.error("List events error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
eventsRouter.post("/", requireRole("admin", "manager", "rep"), async (req, res) => {
  try {
    const { customerId, eventType, eventDate, notes } = req.body;
    if (!customerId || !eventType || !eventDate) {
      res.status(400).json({ error: "customerId, eventType, and eventDate required" });
      return;
    }
    const result = await db.insert(events).values({
      customerId,
      eventType,
      eventDate: new Date(eventDate),
      notes
    }).returning();
    res.status(201).json(result[0]);
  } catch (err) {
    console.error("Create event error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
eventsRouter.patch("/:id", requireRole("admin", "manager", "rep"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { eventType, eventDate, notes } = req.body;
    const updates = {};
    if (eventType !== void 0) updates.eventType = eventType;
    if (eventDate !== void 0) updates.eventDate = new Date(eventDate);
    if (notes !== void 0) updates.notes = notes;
    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "No fields to update" });
      return;
    }
    const result = await db.update(events).set(updates).where(eq6(events.id, id)).returning();
    if (result.length === 0) {
      res.status(404).json({ error: "Event not found" });
      return;
    }
    res.json(result[0]);
  } catch (err) {
    console.error("Update event error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
eventsRouter.get("/:id/report", requireRole("admin", "manager", "rep"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const eventResult = await db.select({
      id: events.id,
      eventType: events.eventType,
      eventDate: events.eventDate,
      notes: events.notes,
      customer: customers.name
    }).from(events).leftJoin(customers, eq6(events.customerId, customers.id)).where(eq6(events.id, id)).limit(1);
    if (eventResult.length === 0) {
      res.status(404).json({ error: "Event not found" });
      return;
    }
    const staffResult = await db.select().from(promoStaff).where(eq6(promoStaff.eventId, id));
    const assetsResult = await db.select({
      id: accountAssets.id,
      assetType: accountAssets.assetType,
      serialNumber: accountAssets.serialNumber,
      placedDate: accountAssets.placedDate
    }).from(accountAssets).where(eq6(accountAssets.customerId, eventResult[0].customerId));
    res.json({
      event: eventResult[0],
      promoStaff: staffResult,
      assets: assetsResult
    });
  } catch (err) {
    console.error("Event report error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// src/routes/promo-staff.ts
import { Router as Router7 } from "express";
import { eq as eq7 } from "drizzle-orm";
var promoStaffRouter = Router7();
promoStaffRouter.use(requireAuth);
promoStaffRouter.get("/", async (_req, res) => {
  try {
    const result = await db.select().from(promoStaff);
    res.json(result);
  } catch (err) {
    console.error("List promo staff error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
promoStaffRouter.post("/", requireRole("admin", "manager"), async (req, res) => {
  try {
    const { name, eventId } = req.body;
    if (!name || !eventId) {
      res.status(400).json({ error: "name and eventId required" });
      return;
    }
    const result = await db.insert(promoStaff).values({ name, eventId }).returning();
    res.status(201).json(result[0]);
  } catch (err) {
    console.error("Create promo staff error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
promoStaffRouter.patch("/:id", requireRole("admin", "manager"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, active } = req.body;
    const updates = {};
    if (name !== void 0) updates.name = name;
    if (active !== void 0) updates.active = active;
    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "No fields to update" });
      return;
    }
    const result = await db.update(promoStaff).set(updates).where(eq7(promoStaff.id, id)).returning();
    if (result.length === 0) {
      res.status(404).json({ error: "Promo staff not found" });
      return;
    }
    res.json(result[0]);
  } catch (err) {
    console.error("Update promo staff error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// src/routes/account-assets.ts
import { Router as Router8 } from "express";
import { eq as eq8 } from "drizzle-orm";
var accountAssetsRouter = Router8();
accountAssetsRouter.use(requireAuth);
accountAssetsRouter.get("/", async (_req, res) => {
  try {
    const result = await db.select({
      id: accountAssets.id,
      customerId: accountAssets.customerId,
      brandId: accountAssets.brandId,
      assetType: accountAssets.assetType,
      serialNumber: accountAssets.serialNumber,
      placedDate: accountAssets.placedDate,
      createdAt: accountAssets.createdAt,
      customer: {
        id: customers.id,
        name: customers.name
      },
      brand: {
        id: brands.id,
        name: brands.name
      }
    }).from(accountAssets).leftJoin(customers, eq8(accountAssets.customerId, customers.id)).leftJoin(brands, eq8(accountAssets.brandId, brands.id));
    res.json(result);
  } catch (err) {
    console.error("List account assets error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
accountAssetsRouter.post("/", requireRole("admin", "manager"), async (req, res) => {
  try {
    const { customerId, brandId, assetType, serialNumber, placedDate } = req.body;
    if (!customerId || !brandId || !assetType) {
      res.status(400).json({ error: "customerId, brandId, and assetType required" });
      return;
    }
    const result = await db.insert(accountAssets).values({
      customerId,
      brandId,
      assetType,
      serialNumber,
      placedDate: placedDate ? new Date(placedDate) : null
    }).returning();
    res.status(201).json(result[0]);
  } catch (err) {
    console.error("Create account asset error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
accountAssetsRouter.patch("/:id", requireRole("admin", "manager"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { assetType, serialNumber, placedDate } = req.body;
    const updates = {};
    if (assetType !== void 0) updates.assetType = assetType;
    if (serialNumber !== void 0) updates.serialNumber = serialNumber;
    if (placedDate !== void 0) updates.placedDate = new Date(placedDate);
    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "No fields to update" });
      return;
    }
    const result = await db.update(accountAssets).set(updates).where(eq8(accountAssets.id, id)).returning();
    if (result.length === 0) {
      res.status(404).json({ error: "Account asset not found" });
      return;
    }
    res.json(result[0]);
  } catch (err) {
    console.error("Update account asset error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
accountAssetsRouter.delete("/:id", requireRole("admin", "manager"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(accountAssets).where(eq8(accountAssets.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error("Delete account asset error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// src/routes/transfers.ts
import { Router as Router9 } from "express";
import { eq as eq9 } from "drizzle-orm";
var transfersRouter = Router9();
transfersRouter.use(requireAuth);
transfersRouter.get("/", async (_req, res) => {
  try {
    const result = await db.select({
      id: transfers.id,
      fromAccountId: transfers.fromAccountId,
      toAccountId: transfers.toAccountId,
      brandId: transfers.brandId,
      quantity: transfers.quantity,
      transferredAt: transfers.transferredAt,
      fromAccount: {
        id: accountAssets.id,
        assetType: accountAssets.assetType
      },
      toAccount: {
        id: accountAssets.id,
        assetType: accountAssets.assetType
      },
      brand: {
        id: brands.id,
        name: brands.name
      }
    }).from(transfers).leftJoin(accountAssets, eq9(transfers.fromAccountId, accountAssets.id)).leftJoin(brands, eq9(transfers.brandId, brands.id));
    res.json(result);
  } catch (err) {
    console.error("List transfers error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
transfersRouter.post("/", requireRole("admin", "manager"), async (req, res) => {
  try {
    const { fromAccountId, toAccountId, brandId, quantity } = req.body;
    if (!brandId || quantity === void 0) {
      res.status(400).json({ error: "brandId and quantity required" });
      return;
    }
    const result = await db.insert(transfers).values({
      fromAccountId: fromAccountId || null,
      toAccountId: toAccountId || null,
      brandId,
      quantity
    }).returning();
    res.status(201).json(result[0]);
  } catch (err) {
    console.error("Create transfer error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// src/routes/requests.ts
import { Router as Router10 } from "express";
import { eq as eq10 } from "drizzle-orm";
var requestsRouter = Router10();
requestsRouter.use(requireAuth);
requestsRouter.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    if (status) {
      const result2 = await db.select({
        id: posRequests.id,
        customerId: posRequests.customerId,
        brandId: posRequests.brandId,
        quantity: posRequests.quantity,
        status: posRequests.status,
        requestedAt: posRequests.requestedAt,
        customer: {
          id: customers.id,
          name: customers.name
        },
        brand: {
          id: brands.id,
          name: brands.name
        }
      }).from(posRequests).leftJoin(customers, eq10(posRequests.customerId, customers.id)).leftJoin(brands, eq10(posRequests.brandId, brands.id)).where(eq10(posRequests.status, status));
      res.json(result2);
      return;
    }
    const result = await db.select({
      id: posRequests.id,
      customerId: posRequests.customerId,
      brandId: posRequests.brandId,
      quantity: posRequests.quantity,
      status: posRequests.status,
      requestedAt: posRequests.requestedAt,
      customer: {
        id: customers.id,
        name: customers.name
      },
      brand: {
        id: brands.id,
        name: brands.name
      }
    }).from(posRequests).leftJoin(customers, eq10(posRequests.customerId, customers.id)).leftJoin(brands, eq10(posRequests.brandId, brands.id));
    res.json(result);
  } catch (err) {
    console.error("List requests error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
requestsRouter.post("/", requireRole("admin", "manager", "rep"), async (req, res) => {
  try {
    const { customerId, brandId, quantity } = req.body;
    if (!customerId || !brandId || !quantity) {
      res.status(400).json({ error: "customerId, brandId, and quantity required" });
      return;
    }
    const result = await db.insert(posRequests).values({
      customerId,
      brandId,
      quantity,
      status: "pending"
    }).returning();
    res.status(201).json(result[0]);
  } catch (err) {
    console.error("Create request error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
requestsRouter.patch("/:id", requireRole("admin", "manager"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    if (!status || !["pending", "approved", "fulfilled"].includes(status)) {
      res.status(400).json({ error: "Valid status required (pending, approved, fulfilled)" });
      return;
    }
    const result = await db.update(posRequests).set({ status }).where(eq10(posRequests.id, id)).returning();
    if (result.length === 0) {
      res.status(404).json({ error: "Request not found" });
      return;
    }
    res.json(result[0]);
  } catch (err) {
    console.error("Update request error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// src/routes/index.ts
var apiRouter = Router11();
apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/customers", customersRouter);
apiRouter.use("/brands", brandsRouter);
apiRouter.use("/inventory", inventoryRouter);
apiRouter.use("/events", eventsRouter);
apiRouter.use("/promo-staff", promoStaffRouter);
apiRouter.use("/account-assets", accountAssetsRouter);
apiRouter.use("/transfers", transfersRouter);
apiRouter.use("/requests", requestsRouter);

// src/app.ts
var app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || "caseflow-dev-secret-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    // set true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1e3
    // 24 hours
  }
}));
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});
app.use("/api", apiRouter);
var STATIC_PATH = "/app/packages/client/dist/public";
app.use(express.static(STATIC_PATH));
app.get("*", (_req, res) => {
  const indexPath = path.join(STATIC_PATH, "index.html");
  res.sendFile(indexPath);
});

// src/index.ts
var PORT = process.env.PORT || 3e3;
var server = createServer(app);
server.listen(PORT, () => {
  console.log(`CaseFlow API running on port ${PORT}`);
});
