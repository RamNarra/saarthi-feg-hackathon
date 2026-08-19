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
    const sessionId = `api_compare_eval_${Date.now()}`;
    
    // Ingest sequential alternation stream: A -> B -> A -> B
    const sequence = [
      { eventType: "SESSION_START" as const },
      { eventType: "EVENT_VIEW" as const, entityId: "arsenal", entityName: "Arsenal" },
      { eventType: "BACK" as const },
      { eventType: "EVENT_VIEW" as const, entityId: "liverpool", entityName: "Liverpool" },
      { eventType: "BACK" as const },
      { eventType: "EVENT_VIEW" as const, entityId: "arsenal", entityName: "Arsenal" },
      { eventType: "BACK" as const },
      { eventType: "EVENT_VIEW" as const, entityId: "liverpool", entityName: "Liverpool" },
    ];

    let lastRes: any;
    for (const step of sequence) {
      const req = new NextRequest("http://localhost:3000/api/v1/session/events", {
        method: "POST",
        body: JSON.stringify({
          sessionId,
          userId: "u1",
          event: step,
        }),
      });
      const res = await handleEventPost(req);
      lastRes = await res.json();
    }

    expect(lastRes.success).toBe(true);
    expect(lastRes.intent.label).toBe("COMPARE");
    expect(lastRes.friction.label).toBe("DECISION_HESITATION");
    expect(lastRes.decision.action).toBe("HELP");
    expect(lastRes.decision.candidateAction).toBe("COMPARE");
    expect(lastRes.decision.netUtilityScore).toBeGreaterThanOrEqual(0.35);
    expect(lastRes.policy.status).toBe("ALLOWED");
  });

  it("POST /v1/interventions/outcome records user dismissal for fatigue calibration", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/interventions/outcome", {
      method: "POST",
      body: JSON.stringify({
        sessionId: "api_test_dismiss_01",
        userId: "u1",
        outcome: "DISMISSED",
      }),
    });

    const res = await handleOutcomePost(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.recordedOutcome).toBe("DISMISSED");
    expect(json.policyState.cooldownActive).toBe(true);
  });
});
