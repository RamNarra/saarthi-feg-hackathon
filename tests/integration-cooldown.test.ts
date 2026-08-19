import { describe, it, expect } from "vitest";
import { POST as handleEventPost } from "../app/api/v1/session/events/route";
import { POST as handleOutcomePost } from "../app/api/v1/interventions/outcome/route";
import { GET as handleStateGet } from "../app/api/v1/session/[id]/state/route";
import { NextRequest } from "next/server";

describe("Authoritative Integration Cycle: Telemetry -> HELP -> Dismissal -> Cooldown -> Suppression", () => {
  const sessionId = `integ_sess_${Date.now()}`;
  const userId = "usr_feg_qa";

  it("Step 1: Ingest alternation events -> Engine evaluates sequence and returns HELP (COMPARE)", async () => {
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

  it("Step 2: User dismisses intervention -> Outcome endpoint activates fatigue cooldown in SessionStore", async () => {
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
  });

  it("Step 3: Check GET /v1/session/:id/state confirms persisted state", async () => {
    const req = new NextRequest(`http://localhost:3000/api/v1/session/${sessionId}/state`);
    const res = await handleStateGet(req, { params: Promise.resolve({ id: sessionId }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.sessionId).toBe(sessionId);
    expect(json.cooldownActive).toBe(true);
    expect(json.dismissalCount).toBe(1);
  });

  it("Step 4: User continues alternation behavior -> Governor checks SessionStore cooldown and SUPPRESSES (DO_NOTHING)", async () => {
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
