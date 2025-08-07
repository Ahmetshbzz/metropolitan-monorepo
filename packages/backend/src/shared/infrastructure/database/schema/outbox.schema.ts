//  "outbox.schema.ts"
//  metropolitan backend
//  Outbox pattern tables for reliable event publishing

import { pgTable, uuid, text, jsonb, timestamp, integer } from "drizzle-orm/pg-core";

export const outboxEvents = pgTable("outbox_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type").notNull(),
  aggregateId: text("aggregate_id"),
  payload: jsonb("payload").notNull(),
  occurredAt: timestamp("occurred_at").notNull().defaultNow(),
  processedAt: timestamp("processed_at"),
  attempt: integer("attempt").notNull().default(0),
  error: text("error"),
});

export const eventIdempotency = pgTable("event_idempotency", {
  id: uuid("id").primaryKey().defaultRandom(),
  handlerKey: text("handler_key").notNull(), // e.g., handlerName:eventId
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
