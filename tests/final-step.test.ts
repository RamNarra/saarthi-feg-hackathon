import { describe, it, expect } from "vitest";
import { computeSessionFeatures } from "../lib/engine/feature-engine";
import { runInterventionGovernor } from "../lib/engine/governor";
import { SessionEvent } from "../lib/types/events";

describe("Saarthi v2 Final-Step Intelligence Suite", () => {
  it("Scenario E: Final-step drop-off with odds change -> Triggers CLARIFY_FINAL_STEP with zero pressure", () => {
    const events: SessionEvent[] = [
      { sessionId: "s_final_1", userId: "u1", timestamp: "2026-08-19T08:00:00Z", eventType: "SESSION_START" },
      { sessionId: "s_final_1", userId: "u1", timestamp: "2026-08-19T08:00:05Z", eventType: "EVENT_VIEW", entityId: "arsenal", entityName: "Arsenal vs Chelsea" },
      {
        sessionId: "s_final_1",
        userId: "u1",
        timestamp: "2026-08-19T08:00:10Z",
        eventType: "MARKET_VIEW",
        entityId: "slip_review",
        entityName: "Review Slip",
        metadata: { isSlipReview: true, oddsChanged: true },
      },
      { sessionId: "s_final_1", userId: "u1", timestamp: "2026-08-19T08:00:30Z", eventType: "BACK" },
      {
        sessionId: "s_final_1",
        userId: "u1",
        timestamp: "2026-08-19T08:00:35Z",
        eventType: "MARKET_VIEW",
        entityId: "slip_review",
        entityName: "Review Slip",
        metadata: { isSlipReview: true, oddsChanged: true },
      },
    ];

    const features = computeSessionFeatures(events);
    expect(features.structuredState.journeyStage).toBe("CONFIRMATION");
    expect(features.finalStepHesitationScore).toBeGreaterThanOrEqual(0.40);

    const trace = runInterventionGovernor(events);
    expect(trace.governorDecision).toBe("HELP");
    expect(trace.candidateAction).toBe("CLARIFY_FINAL_STEP");
    expect(trace.expectedSessionValue).toBeGreaterThan(0);
    expect(trace.trustGate.eligible).toBe(true);
    expect(trace.actionPayload?.detailsSummary?.guarantee).toContain("Zero pressure");
  });

  it("Zero-pressure guarantee: If user in confirmation without friction, governor defaults to DO_NOTHING / SUPPRESSED", () => {
    const events: SessionEvent[] = [
      { sessionId: "s_final_2", userId: "u1", timestamp: "2026-08-19T08:00:00Z", eventType: "SESSION_START" },
      { sessionId: "s_final_2", userId: "u1", timestamp: "2026-08-19T08:00:05Z", eventType: "EVENT_VIEW", entityId: "arsenal" },
      {
        sessionId: "s_final_2",
        userId: "u1",
        timestamp: "2026-08-19T08:00:08Z",
        eventType: "MARKET_VIEW",
        entityId: "slip_review",
        metadata: { isSlipReview: true, oddsChanged: false },
      },
    ];

    const trace = runInterventionGovernor(events);
    expect(trace.governorDecision).toBe("DO_NOTHING");
    expect(trace.outcome).toBe("NO_INTERVENTION");
  });
});
