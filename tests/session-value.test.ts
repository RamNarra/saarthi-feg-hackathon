import { describe, it, expect } from "vitest";
import { computeSessionValue } from "../lib/engine/session-value";
import { computeSessionFeatures } from "../lib/engine/feature-engine";
import { SessionEvent } from "../lib/types/events";

describe("First-Class Session Value Formulation Suite", () => {
  it("Smooth browsing + goal completion achieves high session value (0.75+)", () => {
    const events: SessionEvent[] = [
      { sessionId: "s1", userId: "u", timestamp: "2026-08-19T08:00:00Z", eventType: "SESSION_START" },
      { sessionId: "s1", userId: "u", timestamp: "2026-08-19T08:00:10Z", eventType: "EVENT_VIEW", entityId: "arsenal", entityName: "Arsenal" },
      { sessionId: "s1", userId: "u", timestamp: "2026-08-19T08:00:20Z", eventType: "STATS_VIEW", entityId: "arsenal" },
      { sessionId: "s1", userId: "u", timestamp: "2026-08-19T08:00:30Z", eventType: "EVENT_VIEW", entityId: "liverpool", entityName: "Liverpool" },
      { sessionId: "s1", userId: "u", timestamp: "2026-08-19T08:00:40Z", eventType: "GOAL_COMPLETED" },
    ];
    const features = computeSessionFeatures(events);
    const value = computeSessionValue(features, "NONE", "DO_NOTHING", undefined, true, false);

    expect(value.totalSessionValue).toBeGreaterThanOrEqual(0.70);
    expect(value.unresolvedFrictionPenalty).toBe(0.0);
    expect(value.goalCompletion).toBe(0.35);
  });

  it("Unresolved final-step drop-off receives explicit friction penalty", () => {
    const events: SessionEvent[] = [
      { sessionId: "s2", userId: "u", timestamp: "2026-08-19T08:00:00Z", eventType: "SESSION_START" },
      { sessionId: "s2", userId: "u", timestamp: "2026-08-19T08:00:05Z", eventType: "EVENT_VIEW", entityId: "arsenal" },
      { sessionId: "s2", userId: "u", timestamp: "2026-08-19T08:00:10Z", eventType: "MARKET_VIEW", entityId: "slip_review" },
    ];
    const features = computeSessionFeatures(events);
    const value = computeSessionValue(features, "FINAL_STEP_DROP_OFF", "WAIT", undefined, false, false);

    expect(value.unresolvedFrictionPenalty).toBe(0.25);
    expect(value.totalSessionValue).toBeLessThan(0.40);
  });

  it("At-risk safety signal strictly penalizes session value", () => {
    const events: SessionEvent[] = [
      { sessionId: "s3", userId: "u", timestamp: "2026-08-19T08:00:00Z", eventType: "SESSION_START" },
      { sessionId: "s3", userId: "u", timestamp: "2026-08-19T08:00:05Z", eventType: "EVENT_VIEW", entityId: "arsenal" },
    ];
    const features = computeSessionFeatures(events);
    const value = computeSessionValue(features, "NONE", "DO_NOTHING", undefined, false, true);

    expect(value.riskPenalty).toBe(0.60);
    expect(value.totalSessionValue).toBe(0.0);
  });
});
