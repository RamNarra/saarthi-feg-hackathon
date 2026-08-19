import { describe, it, expect } from "vitest";
import { SessionEvent } from "../lib/types/events";
import { computeSessionFeatures } from "../lib/engine/feature-engine";
import { runInterventionGovernor } from "../lib/engine/governor";

describe("Saarthi Real-Time Decision Engine", () => {
  it("Scenario A: Normal browsing -> DO_NOTHING with restraint reason", () => {
    const events: SessionEvent[] = [
      { sessionId: "s1", userId: "u1", timestamp: "2026-08-19T08:00:00Z", eventType: "SESSION_START" },
      { sessionId: "s1", userId: "u1", timestamp: "2026-08-19T08:00:05Z", eventType: "EVENT_VIEW", entityId: "arsenal", entityName: "Arsenal vs Chelsea" },
      { sessionId: "s1", userId: "u1", timestamp: "2026-08-19T08:00:15Z", eventType: "STATS_VIEW", entityId: "arsenal" },
      { sessionId: "s1", userId: "u1", timestamp: "2026-08-19T08:00:25Z", eventType: "EVENT_VIEW", entityId: "liverpool", entityName: "Liverpool vs Man City" },
    ];

    const trace = runInterventionGovernor(events);
    expect(trace.governorDecision).toBe("DO_NOTHING");
    expect(trace.friction).toBe("NONE");
    expect(trace.policyStatus).toBe("ALLOWED");
    expect(trace.outcome).toBe("NO_INTERVENTION");
  });

  it("Scenario B: Decision Hesitation (A -> B -> A -> B) -> HELP (COMPARE)", () => {
    const events: SessionEvent[] = [
      { sessionId: "s2", userId: "u1", timestamp: "2026-08-19T08:00:00Z", eventType: "SESSION_START" },
      { sessionId: "s2", userId: "u1", timestamp: "2026-08-19T08:00:05Z", eventType: "EVENT_VIEW", entityId: "arsenal", entityName: "Arsenal" },
      { sessionId: "s2", userId: "u1", timestamp: "2026-08-19T08:00:10Z", eventType: "STATS_VIEW" },
      { sessionId: "s2", userId: "u1", timestamp: "2026-08-19T08:00:15Z", eventType: "BACK" },
      { sessionId: "s2", userId: "u1", timestamp: "2026-08-19T08:00:20Z", eventType: "EVENT_VIEW", entityId: "liverpool", entityName: "Liverpool" },
      { sessionId: "s2", userId: "u1", timestamp: "2026-08-19T08:00:25Z", eventType: "STATS_VIEW" },
      { sessionId: "s2", userId: "u1", timestamp: "2026-08-19T08:00:30Z", eventType: "BACK" },
      { sessionId: "s2", userId: "u1", timestamp: "2026-08-19T08:00:35Z", eventType: "EVENT_VIEW", entityId: "arsenal", entityName: "Arsenal" },
      { sessionId: "s2", userId: "u1", timestamp: "2026-08-19T08:00:40Z", eventType: "MARKET_VIEW" },
      { sessionId: "s2", userId: "u1", timestamp: "2026-08-19T08:00:45Z", eventType: "BACK" },
      { sessionId: "s2", userId: "u1", timestamp: "2026-08-19T08:00:50Z", eventType: "EVENT_VIEW", entityId: "liverpool", entityName: "Liverpool" },
    ];

    const trace = runInterventionGovernor(events);
    expect(trace.governorDecision).toBe("HELP");
    expect(trace.candidateAction).toBe("COMPARE");
    expect(trace.friction).toBe("DECISION_HESITATION");
    expect(trace.actionPayload).toBeDefined();
  });

  it("Scenario C: Fatigue guard suppresses repeated interventions after dismissals", () => {
    const events: SessionEvent[] = [
      { sessionId: "s3", userId: "u1", timestamp: "2026-08-19T08:00:00Z", eventType: "SESSION_START" },
      { sessionId: "s3", userId: "u1", timestamp: "2026-08-19T08:00:05Z", eventType: "EVENT_VIEW", entityId: "arsenal" },
      { sessionId: "s3", userId: "u1", timestamp: "2026-08-19T08:00:10Z", eventType: "INTERVENTION_DISMISSED" },
      { sessionId: "s3", userId: "u1", timestamp: "2026-08-19T08:00:20Z", eventType: "EVENT_VIEW", entityId: "liverpool" },
      { sessionId: "s3", userId: "u1", timestamp: "2026-08-19T08:00:25Z", eventType: "INTERVENTION_DISMISSED" },
      { sessionId: "s3", userId: "u1", timestamp: "2026-08-19T08:00:30Z", eventType: "EVENT_VIEW", entityId: "arsenal" },
      { sessionId: "s3", userId: "u1", timestamp: "2026-08-19T08:00:35Z", eventType: "EVENT_VIEW", entityId: "liverpool" },
      { sessionId: "s3", userId: "u1", timestamp: "2026-08-19T08:00:40Z", eventType: "EVENT_VIEW", entityId: "arsenal" },
    ];

    const trace = runInterventionGovernor(events);
    expect(trace.governorDecision).toBe("DO_NOTHING");
    expect(trace.policyStatus).toBe("SUPPRESSED");
  });

  it("Scenario D: Policy guard explicitly blocks intervention", () => {
    const events: SessionEvent[] = [
      { sessionId: "s4", userId: "u1", timestamp: "2026-08-19T08:00:00Z", eventType: "SESSION_START" },
      { sessionId: "s4", userId: "u1", timestamp: "2026-08-19T08:00:05Z", eventType: "EVENT_VIEW", entityId: "arsenal" },
      { sessionId: "s4", userId: "u1", timestamp: "2026-08-19T08:00:10Z", eventType: "EVENT_VIEW", entityId: "liverpool" },
      { sessionId: "s4", userId: "u1", timestamp: "2026-08-19T08:00:15Z", eventType: "EVENT_VIEW", entityId: "arsenal" },
      { sessionId: "s4", userId: "u1", timestamp: "2026-08-19T08:00:20Z", eventType: "EVENT_VIEW", entityId: "liverpool" },
    ];

    const trace = runInterventionGovernor(events, { overridePolicyBlock: true });
    expect(trace.governorDecision).toBe("DO_NOTHING");
    expect(trace.policyStatus).toBe("BLOCKED");
    expect(trace.outcome).toBe("BLOCKED_BY_POLICY");
  });
});
