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
 * Multi-factor Intervention Ranker:
 * Evaluates candidate actions, weighing Expected Usefulness vs Intrusion Cost & Fatigue Penalty.
 */
function rankCandidateInterventions(
  intent: SessionIntent,
  friction: FrictionType,
  frictionConfidence: number,
  features: SessionFeatures,
  fatiguePenalty: number
): CandidateInterventionScore[] {
  const candidates: CandidateInterventionScore[] = [];
  const compSet = features.structuredState.comparisonSet;
  const activeName = features.activeEntityName || "Selected Match";

  // 1. Candidate: COMPARE (Side-by-side)
  let compareUsefulness = 0.05;
  let compareIntrusion = 0.25; // moderate modal / panel
  if (friction === "DECISION_HESITATION" || features.alternationScore >= 0.35) {
    compareUsefulness = 0.88 * frictionConfidence;
  } else if (compSet.length === 2) {
    compareUsefulness = 0.70;
  }
  const compareNet = Math.max(0, compareUsefulness - compareIntrusion - fatiguePenalty);
  candidates.push({
    action: "COMPARE",
    expectedUsefulness: Number(compareUsefulness.toFixed(3)),
    intrusionCost: compareIntrusion,
    netUtilityScore: Number(compareNet.toFixed(3)),
    justification: "Side-by-side metrics breakdown for compared matches",
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

  // 2. Candidate: NARROW (Focus Filters)
  let narrowUsefulness = 0.05;
  let narrowIntrusion = 0.18; // lightweight banner / filter pill
  if (friction === "INFORMATION_OVERLOAD" || features.marketSwitchingCount >= 3) {
    narrowUsefulness = 0.82 * frictionConfidence;
  }
  const narrowNet = Math.max(0, narrowUsefulness - narrowIntrusion - fatiguePenalty);
  candidates.push({
    action: "NARROW",
    expectedUsefulness: Number(narrowUsefulness.toFixed(3)),
    intrusionCost: narrowIntrusion,
    netUtilityScore: Number(narrowNet.toFixed(3)),
    justification: "Filter active markets to primary options",
    payload: {
      title: "Focus on Primary Markets",
      description: "There are 48 active markets. Filter to the top 3 most relevant markets?",
      actionType: "NARROW",
    },
  });

  // 3. Candidate: RESUME (Context Restoration)
  let resumeUsefulness = 0.05;
  let resumeIntrusion = 0.15; // minimal toast
  if (friction === "NAVIGATION" || (friction === "UNCERTAINTY" && features.backtracks >= 2)) {
    resumeUsefulness = 0.79 * frictionConfidence;
  }
  const resumeNet = Math.max(0, resumeUsefulness - resumeIntrusion - fatiguePenalty);
  candidates.push({
    action: "RESUME",
    expectedUsefulness: Number(resumeUsefulness.toFixed(3)),
    intrusionCost: resumeIntrusion,
    netUtilityScore: Number(resumeNet.toFixed(3)),
    justification: "Restore recently viewed match state",
    payload: {
      title: `Resume ${activeName}`,
      description: "Pick up where you left off with key match summaries.",
      actionType: "RESUME",
    },
  });

  // 4. Candidate: EXPLAIN (Grounded Context)
  let explainUsefulness = 0.05;
  let explainIntrusion = 0.20;
  if (friction === "UNCERTAINTY" && features.dwellTimeSeconds > 25) {
    explainUsefulness = 0.72 * frictionConfidence;
  }
  const explainNet = Math.max(0, explainUsefulness - explainIntrusion - fatiguePenalty);
  candidates.push({
    action: "EXPLAIN",
    expectedUsefulness: Number(explainUsefulness.toFixed(3)),
    intrusionCost: explainIntrusion,
    netUtilityScore: Number(explainNet.toFixed(3)),
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
  const intentResult = predictSessionIntent(features);
  const frictionResult = predictSessionFriction(features);
  const modelInferenceLatencyMs = Number((performance.now() - tModelStart).toFixed(3));

  // 4. Multi-factor Candidate Ranking
  const fatiguePenalty = (config?.dismissalCount || features.priorInterventionDismissals) * 0.40;
  const rankedCandidates = rankCandidateInterventions(
    intentResult.intent,
    frictionResult.friction,
    frictionResult.confidence,
    features,
    fatiguePenalty
  );

  const topCandidate = rankedCandidates[0];

  // 5. Policy & Safety Guard Evaluation
  const tGovStart = performance.now();
  const policyResult = evaluatePolicyGuard(
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
  let actionPayload: DecisionTrace["actionPayload"] = undefined;
  let outcome: DecisionTrace["outcome"] = "NO_INTERVENTION";

  const UTILITY_THRESHOLD = 0.35; // Net utility threshold required to justify user interruption

  if (!policyResult.allowed) {
    governorDecision = "DO_NOTHING";
    reason = policyResult.reason;
    outcome = policyResult.status === "BLOCKED" ? "BLOCKED_BY_POLICY" : "NO_INTERVENTION";
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
    actionPayload = topCandidate.payload;
    reason = `Ranked #1 action: ${topCandidate.action} (Net Utility: ${topCandidate.netUtilityScore.toFixed(2)}, Usefulness: ${topCandidate.expectedUsefulness.toFixed(2)}, Cost: ${topCandidate.intrusionCost.toFixed(2)}). ${topCandidate.justification}.`;
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
    policyStatus: policyResult.status,
    policyReason: policyResult.reason,
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
