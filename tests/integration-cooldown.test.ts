import { describe, it, expect, beforeEach } from "vitest";
import { POST as handleEventPost } from "../app/api/v1/session/events/route";
import { POST as handleOutcomePost } from "../app/api/v1/interventions/outcome/route";
import { defaultSessionStore } from "../lib/store/session-store";
import { NextRequest } from "next/server";

describe("Integration: Friction Detection -> Dismissal Cooldown -> Suppression Cycle", () => {
  const sessionId = "integration_test_sess_01";
  const userId = "usr_test_99";

  it("Step 1: User demonstrates alternation friction -> API returns HELP (COMPARE)", async () => {
    const sequence = [
      { eventType: "SESSION_START" },
      { eventType: "EVENT_VIEW", entityId: "arsenal", entityName: "Arsenal" },
      { eventType: "BACK" },
      { eventType: "EVENT_VIEW", entityId: "liverpool", entityName: "Liverpool" },
      { eventType: "BACK" },
      { eventType: "EVENT_VIEW", entityId: "arsenal", entityName: "Arsenal" },
      { eventType: "BACK" },
      { eventType: "EVENT_VIEW", entityId: "liverpool", entityName: "Liverpool" },
    ];

    let lastRes: any;
    for (const item of sequence) {
      const req = new NextRequest("http://localhost:3000/api/v1/session/events", {
        method: "POST",
        body: JSON.stringify({
          sessionId,
          userId,
          event: item,
        }),
      });
      const res = await handleEventPost(req);
      lastRes = await res.json();
    }

    expect(lastRes.success).toBe(true);
    expect(lastRes.friction.label).toBe("DECISION_HESITATION");
    expect(lastRes.decision.action).toBe("HELP");
    expect(lastRes.decision.candidateAction).toBe("COMPARE");
    expect(lastRes.policy.status).toBe("ALLOWED");
  });

  it("Step 2: User dismisses intervention -> Outcome endpoint activates fatigue cooldown", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/interventions/outcome", {
      method: "POST",
      body: JSON.stringify({
        sessionId,
        userId,
        outcome: "DISMISSED",
      }),
    });

    const res = await handleOutcomePost(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.recordedOutcome).toBe("DISMISSED");
    expect(json.policyState.cooldownActive).toBe(true);
    expect(json.policyState.dismissalCount).toBe(1);

    // Second dismissal to hit hard fatigue limit
    const req2 = new NextRequest("http://localhost:3000/api/v1/interventions/outcome", {
      method: "POST",
      body: JSON.stringify({
        sessionId,
        userId,
        outcome: "DISMISSED",
      }),
    });
    const res2 = await handleOutcomePost(req2);
    const json2 = await res2.json();
    expect(json2.policyState.dismissalCount).toBe(2);
  });

  it("Step 3: User repeats same alternation pattern -> Governor SUPPRESSES and returns DO_NOTHING", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/session/events", {
      method: "POST",
      body: JSON.stringify({
        sessionId,
        userId,
        event: {
          eventType: "EVENT_VIEW",
          entityId: "arsenal",
          entityName: "Arsenal",
        },
      }),
    });

    const res = await handleEventPost(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.decision.action).toBe("DO_NOTHING");
    expect(json.policy.status).toBe("SUPPRESSED");
    expect(json.policy.reason).toContain("Fatigue policy");
  });
});
