import { describe, it, expect } from "vitest";
import { POST as handleEventPost } from "../app/api/v1/session/events/route";
import { POST as handleOutcomePost } from "../app/api/v1/interventions/outcome/route";
import { GET as handleHealthGet } from "../app/api/v1/health/route";
import { NextRequest } from "next/server";

describe("Saarthi REST Decision API Suite", () => {
  it("Health endpoint returns status and loaded model telemetry", async () => {
    const res = await handleHealthGet();
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.status).toBe("HEALTHY");
    expect(json.modelStatus.loaded).toBe(true);
  });

  it("POST /v1/session/events processes sequence and returns HELP decision on comparison friction", async () => {
    const sessionId = "api_test_compare_01";
    
    // Simulate event stream: A -> B -> A -> B
    const history = [
      { sessionId, userId: "u1", timestamp: "2026-08-19T08:00:00Z", eventType: "SESSION_START" as const },
      { sessionId, userId: "u1", timestamp: "2026-08-19T08:00:05Z", eventType: "EVENT_VIEW" as const, entityId: "arsenal", entityName: "Arsenal" },
      { sessionId, userId: "u1", timestamp: "2026-08-19T08:00:10Z", eventType: "BACK" as const },
      { sessionId, userId: "u1", timestamp: "2026-08-19T08:00:15Z", eventType: "EVENT_VIEW" as const, entityId: "liverpool", entityName: "Liverpool" },
      { sessionId, userId: "u1", timestamp: "2026-08-19T08:00:20Z", eventType: "BACK" as const },
      { sessionId, userId: "u1", timestamp: "2026-08-19T08:00:25Z", eventType: "EVENT_VIEW" as const, entityId: "arsenal", entityName: "Arsenal" },
      { sessionId, userId: "u1", timestamp: "2026-08-19T08:00:30Z", eventType: "BACK" as const },
    ];

    const req = new NextRequest("http://localhost:3000/api/v1/session/events", {
      method: "POST",
      body: JSON.stringify({
        sessionId,
        userId: "u1",
        event: {
          eventType: "EVENT_VIEW",
          entityId: "liverpool",
          entityName: "Liverpool",
        },
        history,
      }),
    });

    const res = await handleEventPost(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.intent.label).toBe("COMPARE");
    expect(json.friction.label).toBe("DECISION_HESITATION");
    expect(json.decision.action).toBe("HELP");
    expect(json.decision.candidateAction).toBe("COMPARE");
    expect(json.policy.status).toBe("ALLOWED");
  });

  it("POST /v1/interventions/outcome records user dismissal for fatigue calibration", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/interventions/outcome", {
      method: "POST",
      body: JSON.stringify({
        sessionId: "api_test_compare_01",
        userId: "u1",
        outcome: "DISMISSED",
      }),
    });

    const res = await handleOutcomePost(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.recordedOutcome).toBe("DISMISSED");
    expect(json.fatigueCalibrated).toBe(true);
  });
});
