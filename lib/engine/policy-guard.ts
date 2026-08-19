import { FrictionType, SessionIntent, SessionFeatures, TrustGateResult } from "../types/models";

export interface DecisionContext {
  cooldownActive?: boolean;
  dismissalCount?: number;
  remainingInterventionBudget?: number;
  internalTestOverride?: boolean;
  userSelfExcluded?: boolean;
  isUnderage?: boolean;
  atRiskGamblingSignal?: boolean;
}

export function evaluatePolicyGuard(
  intent: SessionIntent,
  friction: FrictionType,
  confidence: number,
  features: SessionFeatures,
  context?: DecisionContext
): TrustGateResult {
  // Scenario D explicit override for internal test harness only
  if (context?.internalTestOverride) {
    return {
      eligible: false,
      status: "BLOCKED",
      gateName: "RESPONSIBLE_PLAY",
      reason: "Responsible-play policy rule: Cooldown guard active. Intervention suppressed to protect user agency.",
    };
  }

  // 1. Critical Compliance Gates (Responsible Gaming, Self-Exclusion, 18+)
  if (context?.userSelfExcluded || context?.atRiskGamblingSignal) {
    return {
      eligible: false,
      status: "BLOCKED",
      gateName: "RESPONSIBLE_PLAY",
      reason: "Trust & Safety Gate: Responsible gaming safety flag active. All proactive interventions strictly suspended.",
    };
  }

  if (context?.isUnderage) {
    return {
      eligible: false,
      status: "BLOCKED",
      gateName: "CONSENT_ELIGIBILITY",
      reason: "Compliance Gate: 18+ verification check required.",
    };
  }

  // 2. Strict Confirmation Zero-Pressure Rule
  // At the confirmation step, NEVER push or urge. Only allow CLARIFY_FINAL_STEP if transparent ambiguity exists.
  if (features.structuredState.journeyStage === "CONFIRMATION" && friction !== "FINAL_STEP_DROP_OFF" && friction !== "DECISION_HESITATION") {
    return {
      eligible: false,
      status: "SUPPRESSED",
      gateName: "CONFIRMATION_ZERO_PRESSURE",
      reason: "Zero-Pressure Policy: User is in final confirmation stage without detected friction. Proactive prompts prohibited.",
    };
  }

  // 3. SessionStore Cooldown & Fatigue State
  if (context?.cooldownActive || (context?.dismissalCount && context.dismissalCount >= 1) || features.priorInterventionDismissals >= 1) {
    return {
      eligible: false,
      status: "SUPPRESSED",
      gateName: "FATIGUE",
      reason: `Fatigue policy: User dismissed previous intervention (${context?.dismissalCount || features.priorInterventionDismissals} dismissal(s)). Cooldown active to prevent intrusion.`,
    };
  }

  // 4. Intervention Budget Exhaustion
  if (context?.remainingInterventionBudget !== undefined && context.remainingInterventionBudget <= 0) {
    return {
      eligible: false,
      status: "SUPPRESSED",
      gateName: "FATIGUE",
      reason: "Intervention budget exhausted: Max in-session assistance allowance reached (3/3).",
    };
  }

  // 5. Early session exploration protection
  if (features.sessionDepth < 3 && friction !== "DECISION_HESITATION" && friction !== "FINAL_STEP_DROP_OFF") {
    return {
      eligible: false,
      status: "SUPPRESSED",
      gateName: "UNCERTAINTY",
      reason: "Context policy: Minimum session exploration threshold not met.",
    };
  }

  // 6. Confidence threshold guard
  if (confidence < 0.60 && friction !== "NONE") {
    return {
      eligible: false,
      status: "SUPPRESSED",
      gateName: "UNCERTAINTY",
      reason: "Uncertainty guard: Model confidence below minimum threshold (0.60).",
    };
  }

  // 7. Full clearance through Trust & Eligibility Gate
  return {
    eligible: true,
    status: "ALLOWED",
    gateName: "RESPONSIBLE_PLAY",
    reason: "Passed all Trust & Eligibility, user-agency, fatigue, and zero-pressure guardrails.",
  };
}
