import { NextRequest, NextResponse } from "next/server";
import { defaultSessionStore } from "@/lib/store/session-store";
import { z } from "zod";

const OutcomePayloadSchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
  interventionId: z.string().optional(),
  outcome: z.enum(["ACCEPTED", "DISMISSED", "EXPIRED", "IGNORED"]),
  feedback: z.string().optional(),
  timestamp: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = OutcomePayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid outcome payload", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { sessionId, userId, outcome } = parsed.data;

    // Record outcome event in session store to trigger real fatigue & cooldown calibration
    const updatedState = await defaultSessionStore.recordOutcome(sessionId, userId, outcome);

    return NextResponse.json({
      success: true,
      sessionId,
      recordedOutcome: outcome,
      policyState: {
        cooldownActive: updatedState.cooldownActive,
        remainingInterventionBudget: updatedState.remainingInterventionBudget,
        dismissalCount: updatedState.dismissalCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to record intervention outcome", message: err.message },
      { status: 500 }
    );
  }
}
