import { FrictionType, SessionIntent, SessionFeatures } from "../types/models";

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
  overridePolicyBlock?: boolean
): PolicyCheckResult {
  // Scenario D explicit override for demo purposes
  if (overridePolicyBlock) {
    return {
      allowed: false,
      status: "BLOCKED",
      reason: "Responsible-play policy rule: Cooldown guard active. Intervention suppressed to protect user agency.",
    };
  }

  // 1. User Agency: Prior dismissal fatigue rule
  if (features.priorInterventionDismissals >= 2) {
    return {
      allowed: false,
      status: "SUPPRESSED",
      reason: "Fatigue policy: User dismissed recent interventions. Suppressing to prevent intrusion.",
    };
  }

  // 2. Early session protection (insufficient context)
  if (features.sessionDepth < 3 && friction !== "DECISION_HESITATION") {
    return {
      allowed: false,
      status: "SUPPRESSED",
      reason: "Context policy: Minimum session exploration threshold not met.",
    };
  }

  // 3. Confidence threshold
  if (confidence < 0.60 && friction !== "NONE") {
    return {
      allowed: false,
      status: "SUPPRESSED",
      reason: "Uncertainty guard: Model confidence below minimum threshold (0.60).",
    };
  }

  // 4. Responsible AI: No dark patterns or urgency
  return {
    allowed: true,
    status: "ALLOWED",
    reason: "Passed all user-agency, fatigue, and responsible-play guardrails.",
  };
}
