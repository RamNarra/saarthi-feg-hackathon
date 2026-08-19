import { SessionEvent } from "../types/events";
import {
  DecisionTrace,
  GovernorDecision,
  InterventionAction,
  CandidateInterventionScore,
  SessionFeatures,
  FrictionType,
  SessionIntent,
} from "../types/models";
import { computeSessionFeatures } from "./feature-engine";
import { predictSessionIntent } from "./intent-model";
import { predictSessionFriction } from "./friction-model";
import { evaluatePolicyGuard, DecisionContext } from "./policy-guard";

export interface GovernorConfig extends DecisionContext {}

/**
 * Contextual Multi-factor Intervention Ranker:
 * Evaluates candidate actions using Intent Fit × Friction Fit × Context Fit × Confidence,
 * subtracting Intrusion Cost and Fatigue Penalty to produce Expected Session Value (ESV).
 */
function rankCandidateInterventions(
  intent: SessionIntent,
  friction: FrictionType,
  frictionConfidence: number,
  intentConfidence: number,
  features: SessionFeatures,
  fatiguePenalty: number
): CandidateInterventionScore[] {
  const candidates: CandidateInterventionScore[] = [];
  const compSet = features.structuredState.comparisonSet;
  const activeName = features.activeEntityName || "Selected Match";
  const finalStep = features.structuredState.finalStepContext;

  // Intent fit matrices (0.0 to 1.0)
  const intentFitMap: Record<InterventionAction, Record<SessionIntent, number>> = {
    CLARIFY_FINAL_STEP: {
      CONFIRM_ACTION: 1.0,
      READY_TO_ACT: 0.9,
      COMPARE: 0.4,
      RESEARCH: 0.3,
      DISCOVER: 0.2,
      FOLLOW: 0.2,
      UNKNOWN: 0.3,
    },
    COMPARE: {
      COMPARE: 1.0,
      RESEARCH: 0.7,
      DISCOVER: 0.4,
      FOLLOW: 0.3,
      READY_TO_ACT: 0.2,
      CONFIRM_ACTION: 0.1,
      UNKNOWN: 0.3,
    },
    EXPLAIN: {
      RESEARCH: 1.0,
      COMPARE: 0.6,
      DISCOVER: 0.5,
      FOLLOW: 0.7,
      READY_TO_ACT: 0.4,
      CONFIRM_ACTION: 0.3,
      UNKNOWN: 0.3,
    },
    NARROW: {
      DISCOVER: 1.0,
      RESEARCH: 0.8,
      COMPARE: 0.4,
      FOLLOW: 0.3,
      READY_TO_ACT: 0.3,
      CONFIRM_ACTION: 0.1,
      UNKNOWN: 0.4,
    },
    RESUME: {
      FOLLOW: 1.0,
      RESEARCH: 0.7,
      DISCOVER: 0.5,
      COMPARE: 0.4,
      READY_TO_ACT: 0.6,
      CONFIRM_ACTION: 0.2,
      UNKNOWN: 0.3,
    },
    ANSWER: {
      RESEARCH: 1.0,
      COMPARE: 0.8,
      DISCOVER: 0.6,
      FOLLOW: 0.6,
      READY_TO_ACT: 0.4,
      CONFIRM_ACTION: 0.3,
      UNKNOWN: 0.4,
    },
  };

  // 1. Candidate: CLARIFY_FINAL_STEP (Final-step drop-off transparency)
  let clarifyFrictionFit = 0.05;
  if (friction === "FINAL_STEP_DROP_OFF" || features.finalStepHesitationScore >= 0.40) {
    clarifyFrictionFit = 0.98;
  } else if (features.structuredState.journeyStage === "CONFIRMATION") {
    clarifyFrictionFit = 0.60;
  }
  const clarifyContextFit = features.structuredState.journeyStage === "CONFIRMATION" || finalStep.stepName !== "NONE" ? 1.0 : 0.3;
  const clarifyIntentFit = intentFitMap.CLARIFY_FINAL_STEP[intent] || 0.5;
  const clarifyUsefulness = clarifyFrictionFit * clarifyIntentFit * clarifyContextFit * (friction === "FINAL_STEP_DROP_OFF" ? 0.95 : frictionConfidence);
  const clarifyIntrusion = 0.12; // ultra-low intrusion transparency banner
  const clarifyNet = Math.max(0, clarifyUsefulness - clarifyIntrusion - fatiguePenalty);

  candidates.push({
    action: "CLARIFY_FINAL_STEP",
    expectedUsefulness: Number(clarifyUsefulness.toFixed(3)),
    intrusionCost: clarifyIntrusion,
    netUtilityScore: Number(clarifyNet.toFixed(3)),
    expectedSessionValue: Number((clarifyNet * 1.45).toFixed(3)),
    justification: "Transparently summarize selections and market terms without pressure",
    payload: {
      title: "Selection Overview & Market Terms",
      description: finalStep.unacknowledgedChange
        ? "Note: Odds updated from 2.10 to 2.25 based on live match conditions. Confirm only if satisfied."
        : "Here is the concise summary of your selected markets and rule terms before you proceed.",
      actionType: "CLARIFY_FINAL_STEP",
      detailsSummary: {
        match: activeName,
        stage: "Review & Confirmation",
        guarantee: "Zero pressure — review at your own pace.",
      },
    },
  });

  // 2. Candidate: COMPARE (Side-by-Side metrics)
  let compareFrictionFit = 0.1;
  if (friction === "DECISION_HESITATION") compareFrictionFit = 0.95;
  else if (friction === "INFORMATION_OVERLOAD") compareFrictionFit = 0.5;
  else if (friction === "UNCERTAINTY") compareFrictionFit = 0.6;

  const compareContextFit = compSet.length === 2 ? 1.0 : features.alternationScore >= 0.35 ? 0.9 : 0.4;
  const compareIntentFit = intentFitMap.COMPARE[intent] || 0.5;
  const compareUsefulness = compareFrictionFit * compareIntentFit * compareContextFit * frictionConfidence;
  const compareIntrusion = 0.25; // moderate modal
  const compareNet = Math.max(0, compareUsefulness - compareIntrusion - fatiguePenalty);

  candidates.push({
    action: "COMPARE",
    expectedUsefulness: Number(compareUsefulness.toFixed(3)),
    intrusionCost: compareIntrusion,
    netUtilityScore: Number(compareNet.toFixed(3)),
    expectedSessionValue: Number((compareNet * 1.25).toFixed(3)),
    justification: "Side-by-side metrics comparison for competing matches",
    payload: {
      title: "Compare Options Side-by-Side",
      description: "Observed alternation between both matches. Would a side-by-side key metrics comparison help?",
      actionType: "COMPARE",
      entities: [
        {
          id: compSet[0]?.id || "arsenal",
          name: compSet[0]?.name || "Arsenal FC",
          details: { form: "W-W-D-W-W", xG: "2.14", possession: "61%", cleanSheets: 11 },
        },
        {
          id: compSet[1]?.id || "liverpool",
          name: compSet[1]?.name || "Liverpool FC",
          details: { form: "W-W-W-D-W", xG: "2.35", possession: "64%", cleanSheets: 13 },
        },
      ],
    },
  });

  // 3. Candidate: NARROW (Focus Filters)
  let narrowFrictionFit = 0.1;
  if (friction === "INFORMATION_OVERLOAD") narrowFrictionFit = 0.95;
  else if (friction === "DISCOVERY") narrowFrictionFit = 0.8;
  else if (friction === "NAVIGATION") narrowFrictionFit = 0.5;

  const narrowContextFit = features.marketSwitchingCount >= 2 || features.scrollDepthAvg > 60 ? 1.0 : 0.5;
  const narrowIntentFit = intentFitMap.NARROW[intent] || 0.5;
  const narrowUsefulness = narrowFrictionFit * narrowIntentFit * narrowContextFit * frictionConfidence;
  const narrowIntrusion = 0.18; // lightweight banner
  const narrowNet = Math.max(0, narrowUsefulness - narrowIntrusion - fatiguePenalty);

  candidates.push({
    action: "NARROW",
    expectedUsefulness: Number(narrowUsefulness.toFixed(3)),
    intrusionCost: narrowIntrusion,
    netUtilityScore: Number(narrowNet.toFixed(3)),
    expectedSessionValue: Number((narrowNet * 1.10).toFixed(3)),
    justification: "Filter active markets to primary options",
    payload: {
      title: "Focus on Primary Markets",
      description: "There are 48 active markets. Filter to the top 3 most relevant markets?",
      actionType: "NARROW",
    },
  });

  // 4. Candidate: RESUME (Context Restoration)
  let resumeFrictionFit = 0.1;
  if (friction === "NAVIGATION") resumeFrictionFit = 0.95;
  else if (friction === "UNCERTAINTY") resumeFrictionFit = 0.75;
  else if (friction === "DECISION_HESITATION") resumeFrictionFit = 0.4;

  const resumeContextFit = features.backtracks >= 2 || features.repeatedRevisits >= 2 ? 1.0 : 0.4;
  const resumeIntentFit = intentFitMap.RESUME[intent] || 0.5;
  const resumeUsefulness = resumeFrictionFit * resumeIntentFit * resumeContextFit * frictionConfidence;
  const resumeIntrusion = 0.15; // minimal toast
  const resumeNet = Math.max(0, resumeUsefulness - resumeIntrusion - fatiguePenalty);

  candidates.push({
    action: "RESUME",
    expectedUsefulness: Number(resumeUsefulness.toFixed(3)),
    intrusionCost: resumeIntrusion,
    netUtilityScore: Number(resumeNet.toFixed(3)),
    expectedSessionValue: Number((resumeNet * 1.15).toFixed(3)),
    justification: "Restore recently viewed match state",
    payload: {
      title: `Resume ${activeName}`,
      description: "Pick up where you left off with key match summaries.",
      actionType: "RESUME",
    },
  });

  // 5. Candidate: EXPLAIN (Grounded Context)
  let explainFrictionFit = 0.1;
  if (friction === "UNCERTAINTY") explainFrictionFit = 0.9;
  else if (friction === "DECISION_HESITATION") explainFrictionFit = 0.7;
  else if (friction === "INFORMATION_OVERLOAD") explainFrictionFit = 0.5;

  const explainContextFit = features.dwellTimeSeconds > 20 ? 1.0 : 0.5;
  const explainIntentFit = intentFitMap.EXPLAIN[intent] || 0.5;
  const explainUsefulness = explainFrictionFit * explainIntentFit * explainContextFit * frictionConfidence;
  const explainIntrusion = 0.20; // drawer / panel
  const explainNet = Math.max(0, explainUsefulness - explainIntrusion - fatiguePenalty);

  candidates.push({
    action: "EXPLAIN",
    expectedUsefulness: Number(explainUsefulness.toFixed(3)),
    intrusionCost: explainIntrusion,
    netUtilityScore: Number(explainNet.toFixed(3)),
    expectedSessionValue: Number((explainNet * 1.20).toFixed(3)),
    justification: "Surface grounded statistical summary",
    payload: {
      title: `Key Insights for ${activeName}`,
      description: "Historical head-to-head records and expected lineup advantages.",
      actionType: "EXPLAIN",
    },
  });

  // Sort descending by Net Utility Score
  candidates.sort((a, b) => b.netUtilityScore - a.netUtilityScore);
  return candidates;
}

export function runInterventionGovernor(
  events: SessionEvent[],
  config?: GovernorConfig
): DecisionTrace {
  const tTotalStart = performance.now();

  const sessionId = events.length > 0 ? events[0].sessionId : `sess_${Date.now()}`;
  const nowStr = new Date().toISOString();

  // 1. Ingestion / Event Processing Timing
  const tEventStart = performance.now();
  const eventProcessingLatencyMs = Number((performance.now() - tEventStart).toFixed(3));

  // 2. Feature Engine & Structured Session State
  const tFeatureStart = performance.now();
  const features = computeSessionFeatures(events);
  const featureCalculationLatencyMs = Number((performance.now() - tFeatureStart).toFixed(3));

  // 3. Model Scoring
  const tModelStart = performance.now();
  let intentResult = predictSessionIntent(features);
  let frictionResult = predictSessionFriction(features);

  // Override if in final step drop-off state
  if (features.finalStepHesitationScore >= 0.40) {
    frictionResult = {
      ...frictionResult,
      friction: "FINAL_STEP_DROP_OFF",
      confidence: 0.94,
    };
    intentResult = {
      ...intentResult,
      intent: "CONFIRM_ACTION",
      confidence: 0.95,
    };
  }

  const modelInferenceLatencyMs = Number((performance.now() - tModelStart).toFixed(3));

  // Populate friction history into structured state
  if (frictionResult.friction !== "NONE") {
    features.structuredState.frictionHistory.push({
      friction: frictionResult.friction,
      confidence: frictionResult.confidence,
      timestamp: nowStr,
    });
  }

  // 4. Multi-factor Candidate Ranking (Intent × Friction × Context × Confidence)
  const fatiguePenalty = (config?.dismissalCount || features.priorInterventionDismissals) * 0.40;
  const rankedCandidates = rankCandidateInterventions(
    intentResult.intent,
    frictionResult.friction,
    frictionResult.confidence,
    intentResult.confidence,
    features,
    fatiguePenalty
  );

  const topCandidate = rankedCandidates[0];

  // 5. Trust & Eligibility Gate Evaluation
  const tGovStart = performance.now();
  const trustGateResult = evaluatePolicyGuard(
    intentResult.intent,
    frictionResult.friction,
    frictionResult.confidence,
    features,
    config
  );

  let governorDecision: GovernorDecision = "DO_NOTHING";
  let candidateAction: InterventionAction | undefined = undefined;
  let reason = "No intervention needed.";
  let expectedHelpValue = 0.1;
  let selectedUtility = 0.0;
  let intrusionCost = 0.0;
  let netUtilityScore = 0.0;
  let expectedSessionValue = 0.0;
  let actionPayload: DecisionTrace["actionPayload"] = undefined;
  let outcome: DecisionTrace["outcome"] = "NO_INTERVENTION";

  const UTILITY_THRESHOLD = 0.22; // Net utility threshold required to justify user interruption

  if (!trustGateResult.eligible) {
    governorDecision = "DO_NOTHING";
    reason = trustGateResult.reason;
    outcome = trustGateResult.status === "BLOCKED" ? "BLOCKED_BY_POLICY" : "NO_INTERVENTION";
  } else if (frictionResult.friction === "NONE") {
    governorDecision = "DO_NOTHING";
    reason = "User navigating smoothly. Restraint applied (no unsolicited interruptions).";
    outcome = "NO_INTERVENTION";
  } else if (frictionResult.confidence < 0.60) {
    governorDecision = "WAIT";
    reason = `Friction detected (${frictionResult.friction}) with moderate confidence (${Math.round(frictionResult.confidence * 100)}%). Awaiting clearer sequence signals.`;
    outcome = "NO_INTERVENTION";
  } else if (topCandidate && topCandidate.netUtilityScore >= UTILITY_THRESHOLD) {
    // Intervene with highest ranked minimal action
    governorDecision = "HELP";
    candidateAction = topCandidate.action;
    expectedHelpValue = topCandidate.expectedUsefulness;
    selectedUtility = topCandidate.expectedUsefulness;
    intrusionCost = topCandidate.intrusionCost;
    netUtilityScore = topCandidate.netUtilityScore;
    expectedSessionValue = topCandidate.expectedSessionValue;
    actionPayload = topCandidate.payload;
    reason = `Ranked #1 action: ${topCandidate.action} (Net Utility: ${topCandidate.netUtilityScore.toFixed(2)}, Value Uplift: +${topCandidate.expectedSessionValue.toFixed(2)}, Cost: ${topCandidate.intrusionCost.toFixed(2)}). ${topCandidate.justification}.`;
    outcome = "INTERVENTION_OFFERED";
  } else {
    // Utility does not outweigh intrusion cost
    governorDecision = "WAIT";
    reason = `Intervention suppressed by Utility Governor: Top candidate ${topCandidate?.action} net utility (${topCandidate?.netUtilityScore.toFixed(2)}) did not exceed minimum threshold (${UTILITY_THRESHOLD}).`;
    outcome = "NO_INTERVENTION";
  }

  const governorLatencyMs = Number((performance.now() - tGovStart).toFixed(3));
  const totalDecisionLatencyMs = Number((performance.now() - tTotalStart).toFixed(3));

  return {
    id: `trace_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    sessionId,
    timestamp: nowStr,
    intent: intentResult.intent,
    intentConfidence: intentResult.confidence,
    friction: frictionResult.friction,
    frictionConfidence: frictionResult.confidence,
    governorDecision,
    candidateAction,
    rankedCandidates,
    selectedUtility,
    intrusionCost,
    netUtilityScore,
    expectedSessionValue,
    policyStatus: trustGateResult.status,
    policyReason: trustGateResult.reason,
    trustGate: trustGateResult,
    reason,
    expectedHelpValue,
    structuredState: features.structuredState,
    actionPayload,
    metrics: {
      eventProcessingLatencyMs,
      featureCalculationLatencyMs,
      modelInferenceLatencyMs,
      governorLatencyMs,
      totalDecisionLatencyMs,
    },
    outcome,
  };
}
