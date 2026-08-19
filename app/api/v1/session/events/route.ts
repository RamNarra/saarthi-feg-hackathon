import { NextRequest, NextResponse } from "next/server";
import { SessionEventSchema } from "@/lib/types/events";
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
  config: z.object({
    overridePolicyBlock: z.boolean().optional(),
  }).optional(),
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

    const { sessionId, userId, event, history, config } = parsed.data;

    const incomingEvent = {
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

    // Use SessionStore or client stateless history if supplied
    let activeEvents: any[];
    if (history && history.length > 0) {
      activeEvents = [...history, incomingEvent];
    } else {
      const state = await defaultSessionStore.appendEvent(sessionId, userId, incomingEvent);
      activeEvents = state.events;
    }

    // Run Saarthi Decision Engine
    const decisionTrace = runInterventionGovernor(activeEvents, config);
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
        payload: decisionTrace.actionPayload || null,
      },
      policy: {
        status: decisionTrace.policyStatus, // ALLOWED | BLOCKED | SUPPRESSED
        reason: decisionTrace.policyReason,
      },
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
  const latestTrace = events.length > 0 ? runInterventionGovernor(events) : null;

  return NextResponse.json({
    sessionId,
    eventCount: events.length,
    sessionState,
    latestDecision: latestTrace,
  });
}
