import { SessionFeatures, FrictionType, GovernorDecision, InterventionAction } from "../types/models";

export interface SessionValueComponents {
  goalCompletion: number;       // +0.30 if goal completed without coercion
  discoveryValue: number;       // +0.15 for unique entities & deep engagement
  meaningfulEngagement: number; // +0.15 for active evaluation / stats review
  satisfactionProxy: number;    // +0.15 for smooth progression or accepted helpful intervention
  unresolvedFrictionPenalty: number; // -0.20 if user abandoned with unresolved hesitation/overload
  intrusionPenalty: number;     // -0.05 if an intervention was dismissed or deemed intrusive
  riskPenalty: number;          // -0.50 if user exhibited rapid stake jumps or at-risk signs
  totalSessionValue: number;    // 0.00 to 1.00 normalized composite metric
}

export function computeSessionValue(
  features: SessionFeatures,
  latestFriction: FrictionType,
  decision: GovernorDecision,
  recordedOutcome?: "ACCEPTED" | "DISMISSED" | "EXPIRED" | "IGNORED",
  isGoalCompleted: boolean = false,
  isAtRisk: boolean = false
): SessionValueComponents {
  // 1. Goal Completion
  const goalCompletion = isGoalCompleted ? 0.35 : (features.structuredState.journeyStage === "CONFIRMATION" ? 0.15 : 0.0);

  // 2. Discovery Value (Content breadth)
  const discoveryValue = Math.min(0.20, Number(((features.uniqueEntitiesCount * 0.05) + (features.contentDiversityRatio * 0.05)).toFixed(2)));

  // 3. Meaningful Engagement (Stats / markets reviewed without disorientation)
  const meaningfulEngagement = Math.min(0.20, Number(((features.eventOpens * 0.03) + (features.dwellTimeSeconds > 25 ? 0.08 : 0.04)).toFixed(2)));

  // 4. Satisfaction Proxy
  let satisfactionProxy = 0.05;
  if (recordedOutcome === "ACCEPTED") {
    satisfactionProxy = 0.20;
  } else if (latestFriction === "NONE" && features.sessionDepth >= 4) {
    satisfactionProxy = 0.15;
  }

  // 5. Penalties
  let unresolvedFrictionPenalty = 0.0;
  if (latestFriction !== "NONE" && !isGoalCompleted && recordedOutcome !== "ACCEPTED") {
    unresolvedFrictionPenalty = latestFriction === "FINAL_STEP_DROP_OFF" ? 0.25 : 0.15;
  }

  const intrusionPenalty = recordedOutcome === "DISMISSED" ? 0.08 : (decision === "HELP" && !recordedOutcome ? 0.02 : 0.0);
  const riskPenalty = isAtRisk ? 0.60 : 0.0;

  // Composite Normalized Session Value (Bound 0.0 to 1.0)
  const rawSum = goalCompletion + discoveryValue + meaningfulEngagement + satisfactionProxy - unresolvedFrictionPenalty - intrusionPenalty - riskPenalty;
  const totalSessionValue = Number(Math.max(0.0, Math.min(1.0, rawSum)).toFixed(2));

  return {
    goalCompletion,
    discoveryValue,
    meaningfulEngagement,
    satisfactionProxy,
    unresolvedFrictionPenalty,
    intrusionPenalty,
    riskPenalty,
    totalSessionValue,
  };
}
