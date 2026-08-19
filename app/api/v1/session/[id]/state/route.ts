import { NextRequest, NextResponse } from "next/server";
import { defaultSessionStore } from "@/lib/store/session-store";
import { runInterventionGovernor } from "@/lib/engine/governor";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const sessionState = await defaultSessionStore.getSessionState(sessionId);

    if (!sessionState) {
      return NextResponse.json(
        { error: "Session not found", sessionId },
        { status: 404 }
      );
    }

    const events = sessionState.events;
    const latestDecision = events.length > 0 ? runInterventionGovernor(events, {
      cooldownActive: sessionState.cooldownActive,
      dismissalCount: sessionState.dismissalCount,
      remainingInterventionBudget: sessionState.remainingInterventionBudget,
    }) : null;

    return NextResponse.json({
      sessionId,
      userId: sessionState.userId,
      eventCount: events.length,
      cooldownActive: sessionState.cooldownActive,
      dismissalCount: sessionState.dismissalCount,
      acceptanceCount: sessionState.acceptanceCount,
      remainingInterventionBudget: sessionState.remainingInterventionBudget,
      lastOutcomeTimestamp: sessionState.lastOutcomeTimestamp || null,
      latestDecision: latestDecision ? {
        action: latestDecision.governorDecision,
        intent: latestDecision.intent,
        friction: latestDecision.friction,
        policyStatus: latestDecision.policyStatus,
      } : null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to retrieve session state", message: err.message },
      { status: 500 }
    );
  }
}
