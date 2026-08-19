import { describe, it, expect } from "vitest";
import { runInterventionGovernor } from "../lib/engine/governor";
import { SessionEvent } from "../lib/types/events";

describe("Trust & Eligibility Compliance Gate Suite", () => {
  const baseFrictionEvents: SessionEvent[] = [
    { sessionId: "s_comp_1", userId: "u", timestamp: "2026-08-19T08:00:00Z", eventType: "SESSION_START" },
    { sessionId: "s_comp_1", userId: "u", timestamp: "2026-08-19T08:00:05Z", eventType: "EVENT_VIEW", entityId: "arsenal", entityName: "Arsenal" },
    { sessionId: "s_comp_1", userId: "u", timestamp: "2026-08-19T08:00:10Z", eventType: "BACK" },
    { sessionId: "s_comp_1", userId: "u", timestamp: "2026-08-19T08:00:15Z", eventType: "EVENT_VIEW", entityId: "liverpool", entityName: "Liverpool" },
    { sessionId: "s_comp_1", userId: "u", timestamp: "2026-08-19T08:00:20Z", eventType: "BACK" },
    { sessionId: "s_comp_1", userId: "u", timestamp: "2026-08-19T08:00:25Z", eventType: "EVENT_VIEW", entityId: "arsenal", entityName: "Arsenal" },
  ];

  it("Self-exclusion flag triggers immediate BLOCKED status and DO_NOTHING decision", () => {
    const trace = runInterventionGovernor(baseFrictionEvents, { userSelfExcluded: true });
    expect(trace.governorDecision).toBe("DO_NOTHING");
    expect(trace.policyStatus).toBe("BLOCKED");
    expect(trace.trustGate.gateName).toBe("RESPONSIBLE_PLAY");
    expect(trace.policyReason).toContain("Responsible gaming safety flag active");
  });

  it("At-risk behavioral markers trigger 100% proactive intervention suppression", () => {
    const trace = runInterventionGovernor(baseFrictionEvents, { atRiskGamblingSignal: true });
    expect(trace.governorDecision).toBe("DO_NOTHING");
    expect(trace.policyStatus).toBe("BLOCKED");
    expect(trace.trustGate.eligible).toBe(false);
  });

  it("Underage unverified status triggers compliance gate block", () => {
    const trace = runInterventionGovernor(baseFrictionEvents, { isUnderage: true });
    expect(trace.governorDecision).toBe("DO_NOTHING");
    expect(trace.policyStatus).toBe("BLOCKED");
    expect(trace.trustGate.gateName).toBe("CONSENT_ELIGIBILITY");
  });

  it("Confirmation step without friction strictly enforces zero-pressure DO_NOTHING rule", () => {
    const confirmationEvents: SessionEvent[] = [
      { sessionId: "s_comp_2", userId: "u", timestamp: "2026-08-19T08:00:00Z", eventType: "SESSION_START" },
      { sessionId: "s_comp_2", userId: "u", timestamp: "2026-08-19T08:00:05Z", eventType: "EVENT_VIEW", entityId: "arsenal" },
      { sessionId: "s_comp_2", userId: "u", timestamp: "2026-08-19T08:00:08Z", eventType: "MARKET_VIEW", entityId: "slip_review", metadata: { isSlipReview: true } },
    ];
    const trace = runInterventionGovernor(confirmationEvents);
    expect(trace.governorDecision).toBe("DO_NOTHING");
    expect(trace.trustGate.gateName).toBe("CONFIRMATION_ZERO_PRESSURE");
  });
});
