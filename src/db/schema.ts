import { pgTable, uuid, varchar, integer, timestamp, text, boolean } from "drizzle-orm/pg-core";

export const orders = pgTable("folio_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  requestKey: uuid("request_key").notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 254 }).notNull(),
  country: varchar("country", { length: 80 }).notNull(),
  license: varchar("license", { length: 20 }).notNull(),
  subtotal: integer("subtotal").notNull(),
  discount: integer("discount").notNull().default(0),
  total: integer("total").notNull(),
  promoCode: varchar("promo_code", { length: 30 }),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  stripeSessionId: varchar("stripe_session_id", { length: 255 }).unique(),
  updates: boolean("updates").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const subscribers = pgTable("folio_subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 254 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contactMessages = pgTable("folio_contact_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 254 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
