import { NextRequest, NextResponse } from "next/server";
import { SessionEvent, SessionEventSchema } from "@/lib/types/events";
import { runInterventionGovernor } from "@/lib/engine/governor";
import { defaultSessionStore } from "@/lib/store/session-store";
import { z } from "zod";

const IngestionPayloadSchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
  event: z.object({
    eventType: SessionEventSchema.shape.eventType,
    entityId: z.string().optional(),
    entityName: z.string().optional(),
    entityType: SessionEventSchema.shape.entityType.optional(),
    timestamp: z.string().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  }),
  history: z.array(SessionEventSchema).optional(),
});

export async function POST(req: NextRequest) {
  const t0 = performance.now();
  try {
    const body = await req.json();
    const parsed = IngestionPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid event payload", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { sessionId, userId, event, history } = parsed.data;

    const incomingEvent: SessionEvent = {
      id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sessionId,
      userId,
      timestamp: event.timestamp || new Date().toISOString(),
      eventType: event.eventType,
      entityId: event.entityId,
      entityName: event.entityName,
      entityType: event.entityType,
      metadata: event.metadata || {},
    };

    // Option C (Hybrid Authoritative Architecture):
    let activeEvents: SessionEvent[];
    if (history && history.length > 0) {
      activeEvents = [...history, incomingEvent];
      // Seed missing events to store
      const existing = await defaultSessionStore.getEvents(sessionId);
      if (existing.length === 0) {
        for (const h of activeEvents) {
          await defaultSessionStore.appendEvent(sessionId, userId, h);
        }
      }
    } else {
      const stateRecord = await defaultSessionStore.appendEvent(sessionId, userId, incomingEvent);
      activeEvents = stateRecord.events;
    }

    const sessionState = await defaultSessionStore.getSessionState(sessionId);
    const decisionContext = {
      cooldownActive: sessionState?.cooldownActive,
      dismissalCount: sessionState?.dismissalCount,
      remainingInterventionBudget: sessionState?.remainingInterventionBudget,
    };

    // Run Saarthi Decision Engine with candidate ranking
    const decisionTrace = runInterventionGovernor(activeEvents, decisionContext);
    const apiLatencyMs = Number((performance.now() - t0).toFixed(3));

    return NextResponse.json({
      success: true,
      sessionId,
      eventId: incomingEvent.id,
      sessionDepth: activeEvents.length,
      intent: {
        label: decisionTrace.intent,
        confidence: decisionTrace.intentConfidence,
      },
      friction: {
        label: decisionTrace.friction,
        confidence: decisionTrace.frictionConfidence,
        signals: [decisionTrace.reason],
      },
      decision: {
        action: decisionTrace.governorDecision, // HELP | WAIT | DO_NOTHING
        candidateAction: decisionTrace.candidateAction, // COMPARE | EXPLAIN | NARROW | RESUME | ANSWER
        expectedHelpValue: decisionTrace.expectedHelpValue,
        selectedUtility: decisionTrace.selectedUtility,
        intrusionCost: decisionTrace.intrusionCost,
        netUtilityScore: decisionTrace.netUtilityScore,
        rankedCandidates: decisionTrace.rankedCandidates,
        payload: decisionTrace.actionPayload || null,
      },
      policy: {
        status: decisionTrace.policyStatus, // ALLOWED | BLOCKED | SUPPRESSED
        reason: decisionTrace.policyReason,
        cooldownActive: sessionState?.cooldownActive ?? false,
        remainingBudget: sessionState?.remainingInterventionBudget ?? 3,
      },
      structuredState: decisionTrace.structuredState,
      telemetry: {
        engineLatencyMs: decisionTrace.metrics.totalDecisionLatencyMs,
        apiLatencyMs,
        measuredAt: decisionTrace.timestamp,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal decision engine error", message: err.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId query parameter required" }, { status: 400 });
  }

  const sessionState = await defaultSessionStore.getSessionState(sessionId);
  const events = sessionState?.events || [];
  const latestTrace = events.length > 0 ? runInterventionGovernor(events, {
    cooldownActive: sessionState?.cooldownActive,
    dismissalCount: sessionState?.dismissalCount,
    remainingInterventionBudget: sessionState?.remainingInterventionBudget,
  }) : null;

  return NextResponse.json({
    sessionId,
    eventCount: events.length,
    sessionState,
    latestDecision: latestTrace,
  });
}
