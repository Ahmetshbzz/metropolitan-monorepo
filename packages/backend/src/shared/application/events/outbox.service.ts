//  "outbox.service.ts"
//  metropolitan backend
//  Outbox writer + polling dispatcher

import { and, eq, isNull, sql } from "drizzle-orm";

import { db } from "../../infrastructure/database/connection";
import {
  eventIdempotency,
  outboxEvents,
} from "../../infrastructure/database/schema";

import type { DomainEvent } from "./domain-events";
import { InProcessEventBus } from "./event-bus";

// Single instance for app process
const inProcessBus = new InProcessEventBus();

export function getEventBus() {
  return inProcessBus;
}

export class OutboxService {
  static async addEvent(event: DomainEvent) {
    try {
      await db.insert(outboxEvents).values({
        id: event.id,
        type: event.type,
        aggregateId: event.aggregateId ?? null,
        payload: event.payload,
        occurredAt: new Date(event.occurredAt),
        attempt: 0,
      });
    } catch (_err) {
      // Fallback when outbox table is not migrated yet: publish in-process
      console.warn(
        "Outbox insert failed; falling back to in-process publish",
        _err
      );
      await getEventBus().publish(event);
    }
  }

  static async markProcessed(id: string) {
    try {
      await db
        .update(outboxEvents)
        .set({ processedAt: new Date() })
        .where(eq(outboxEvents.id, id));
    } catch (_e) {
      // ignore when table not present
    }
  }

  static async incrementAttempt(id: string, error?: string) {
    try {
      await db
        .update(outboxEvents)
        .set({
          attempt: sql`${outboxEvents.attempt} + 1`,
          error,
        })
        .where(eq(outboxEvents.id, id));
    } catch (_e) {
      // ignore when table not present
    }
  }

  static async hasHandled(handlerKey: string) {
    try {
      const existing = await db
        .select({ id: eventIdempotency.id })
        .from(eventIdempotency)
        .where(eq(eventIdempotency.handlerKey, handlerKey))
        .limit(1);
      return existing.length > 0;
    } catch (_e) {
      // if table doesn't exist yet, treat as not handled
      return false;
    }
  }

  static async markHandled(handlerKey: string) {
    try {
      await db.insert(eventIdempotency).values({ handlerKey });
    } catch {
      // ignore when table not present
    }
  }
}

// Basic polling loop (can be improved with NOTIFY/LISTEN)
const DEFAULT_POLL_INTERVAL_MS = 1000;
const MAX_ATTEMPTS = 10;

let dispatcherStarted = false;
export function startOutboxDispatcher(
  pollIntervalMs = DEFAULT_POLL_INTERVAL_MS
) {
  if (dispatcherStarted) return;
  dispatcherStarted = true;

  const tick = async () => {
    try {
      const pending = await db
        .select({
          id: outboxEvents.id,
          type: outboxEvents.type,
          payload: outboxEvents.payload,
          aggregateId: outboxEvents.aggregateId,
          attempt: outboxEvents.attempt,
        })
        .from(outboxEvents)
        .where(
          and(
            isNull(outboxEvents.processedAt),
            sql`${outboxEvents.attempt} < ${MAX_ATTEMPTS}`
          )
        )
        .orderBy(outboxEvents.occurredAt)
        .limit(50);

      for (const row of pending) {
        const event: DomainEvent = {
          id: String(row.id),
          type: row.type,
          // Drizzle jsonb comes back as unknown; we store arbitrary payloads, keep them as-object
          payload: row.payload as Record<string, unknown>,
          occurredAt: new Date(),
          aggregateId: row.aggregateId ?? undefined,
        };

        try {
          await getEventBus().publish(event);
          await OutboxService.markProcessed(event.id);
        } catch (err) {
          await OutboxService.incrementAttempt(
            event.id,
            err instanceof Error ? err.message : String(err)
          );
        }
      }
    } catch (_err) {
      // Table might not exist during dev/test; keep silent
      // console.debug("Outbox dispatcher inactive:", err);
    } finally {
      setTimeout(tick, pollIntervalMs);
    }
  };

  // Start loop
  setTimeout(tick, pollIntervalMs);
}
