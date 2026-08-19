import { z } from "zod";

export const EventTypeEnum = z.enum([
  "SESSION_START",
  "SESSION_END",
  "SEARCH",
  "EVENT_VIEW",
  "MARKET_VIEW",
  "STATS_VIEW",
  "PLAYER_VIEW",
  "SCROLL",
  "BACK",
  "COMPARE",
  "SAVE",
  "INTERVENTION_SHOWN",
  "INTERVENTION_ACCEPTED",
  "INTERVENTION_DISMISSED",
  "GOAL_COMPLETED",
]);

export type EventType = z.infer<typeof EventTypeEnum>;

export interface SessionEvent {
  id?: string;
  sessionId: string;
  userId: string;
  timestamp: string;
  eventType: EventType;
  entityId?: string;
  entityName?: string;
  entityType?: "event" | "team" | "player" | "market" | "sport" | "general";
  metadata?: Record<string, unknown>;
}

export const SessionEventSchema = z.object({
  id: z.string().optional(),
  sessionId: z.string(),
  userId: z.string(),
  timestamp: z.string(),
  eventType: EventTypeEnum,
  entityId: z.string().optional(),
  entityName: z.string().optional(),
  entityType: z.enum(["event", "team", "player", "market", "sport", "general"]).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
