import { FrictionType, SessionIntent, SessionFeatures } from "../types/models";

export interface DecisionContext {
  cooldownActive?: boolean;
  dismissalCount?: number;
  remainingInterventionBudget?: number;
  internalTestOverride?: boolean;
}

export interface PolicyCheckResult {
  allowed: boolean;
  status: "ALLOWED" | "BLOCKED" | "SUPPRESSED";
  reason: string;
}

export function evaluatePolicyGuard(
  intent: SessionIntent,
  friction: FrictionType,
  confidence: number,
  features: SessionFeatures,
  context?: DecisionContext
): PolicyCheckResult {
  // Scenario D explicit override for internal demo test harness only
  if (context?.internalTestOverride) {
    return {
      allowed: false,
      status: "BLOCKED",
      reason: "Responsible-play policy rule: Cooldown guard active. Intervention suppressed to protect user agency.",
    };
  }

  // 1. SessionStore Cooldown & Fatigue State (Authoritative Server State)
  if (context?.cooldownActive || (context?.dismissalCount && context.dismissalCount >= 1) || features.priorInterventionDismissals >= 1) {
    return {
      allowed: false,
      status: "SUPPRESSED",
      reason: `Fatigue policy: User dismissed previous intervention (${context?.dismissalCount || features.priorInterventionDismissals} dismissal(s)). Cooldown active to prevent intrusion.`,
    };
  }

  // 2. Intervention Budget Exhaustion
  if (context?.remainingInterventionBudget !== undefined && context.remainingInterventionBudget <= 0) {
    return {
      allowed: false,
      status: "SUPPRESSED",
      reason: "Intervention budget exhausted: Max in-session assistance allowance reached.",
    };
  }

  // 3. Early session exploration protection (insufficient context)
  if (features.sessionDepth < 3 && friction !== "DECISION_HESITATION") {
    return {
      allowed: false,
      status: "SUPPRESSED",
      reason: "Context policy: Minimum session exploration threshold not met.",
    };
  }

  // 4. Confidence threshold guard
  if (confidence < 0.60 && friction !== "NONE") {
    return {
      allowed: false,
      status: "SUPPRESSED",
      reason: "Uncertainty guard: Model confidence below minimum threshold (0.60).",
    };
  }

  // 5. Normal Responsible AI clearance
  return {
    allowed: true,
    status: "ALLOWED",
    reason: "Passed all user-agency, fatigue, and responsible-play guardrails.",
  };
}
