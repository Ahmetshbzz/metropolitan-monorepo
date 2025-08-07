//  "domain-events.ts"
//  metropolitan backend
//  Core domain event types and helpers for modular monolith + event-driven design

export interface DomainEvent<
  Payload extends Record<string, unknown> = Record<string, unknown>,
> {
  id: string; // UUID
  type: string; // e.g., "order.created"
  occurredAt: Date;
  aggregateId?: string;
  payload: Payload;
}

// Helper to create events with sane defaults
import { randomUUID } from "crypto";

export function createDomainEvent<Payload extends Record<string, unknown>>(
  type: string,
  payload: Payload,
  aggregateId?: string
): DomainEvent<Payload> {
  return {
    id: randomUUID(),
    type,
    occurredAt: new Date(),
    aggregateId,
    payload,
  };
}

// Common event types used initially
export type OrderCreatedEvent = DomainEvent<{
  orderId: string;
  userId: string;
  totalAmount: string | number;
  currency: string;
}>;

export type PaymentSucceededEvent = DomainEvent<{
  orderId: string;
  userId: string;
  paymentIntentId: string;
}>;

export type PaymentFailedEvent = DomainEvent<{
  orderId: string;
  reason?: string;
}>;
