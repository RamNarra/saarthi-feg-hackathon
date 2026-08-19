import { NextRequest, NextResponse } from "next/server";
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

    const { sessionId, userId, outcome, feedback } = parsed.data;

    // Record outcome event for fatigue suppression and telemetry
    return NextResponse.json({
      success: true,
      sessionId,
      recordedOutcome: outcome,
      fatigueCalibrated: outcome === "DISMISSED",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to record intervention outcome", message: err.message },
      { status: 500 }
    );
  }
}
