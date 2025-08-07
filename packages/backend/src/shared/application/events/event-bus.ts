//  "event-bus.ts"
//  metropolitan backend
//  In-process event bus abstraction + simple implementation

import type { DomainEvent } from "./domain-events";

export interface EventBusSubscriber {
  eventType: string; // '*' allowed for all events
  handle: (event: DomainEvent) => Promise<void> | void;
}

export interface EventBus {
  publish: (event: DomainEvent) => Promise<void>;
  subscribe: (subscriber: EventBusSubscriber) => void;
}

export class InProcessEventBus implements EventBus {
  private subscribers: EventBusSubscriber[] = [];

  subscribe(subscriber: EventBusSubscriber): void {
    this.subscribers.push(subscriber);
  }

  async publish(event: DomainEvent): Promise<void> {
    const relevant = this.subscribers.filter(
      (s) => s.eventType === event.type || s.eventType === "*"
    );

    await Promise.all(
      relevant.map(async (s) => {
        try {
          await s.handle(event);
        } catch (err) {
          // swallow to not crash publisher; real impl should log/metric
          console.error("Event handler error", { eventType: event.type }, err);
        }
      })
    );
  }
}
