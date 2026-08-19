import { SessionEvent } from "../types/events";
import { DecisionTrace, GovernorDecision, InterventionAction } from "../types/models";
import { computeSessionFeatures } from "./feature-engine";
import { predictSessionIntent } from "./intent-model";
import { predictSessionFriction } from "./friction-model";
import { evaluatePolicyGuard } from "./policy-guard";

export interface GovernorConfig {
  helpThreshold?: number;
  overridePolicyBlock?: boolean;
}

export function runInterventionGovernor(
  events: SessionEvent[],
  config?: GovernorConfig
): DecisionTrace {
  const t0 = performance.now();

  const sessionId = events.length > 0 ? events[0].sessionId : `sess_${Date.now()}`;
  const nowStr = new Date().toISOString();

  // 1. Feature Engine
  const tFeatureStart = performance.now();
  const features = computeSessionFeatures(events);
  const featureCalculationLatencyMs = Number((performance.now() - tFeatureStart).toFixed(2));

  // 2. Models
  const tModelStart = performance.now();
  const intentResult = predictSessionIntent(features);
  const frictionResult = predictSessionFriction(features);
  const modelInferenceLatencyMs = Number((performance.now() - tModelStart).toFixed(2));

  // 3. Policy & Safety Guard
  const tGovStart = performance.now();
  const policyResult = evaluatePolicyGuard(
    intentResult.intent,
    frictionResult.friction,
    frictionResult.confidence,
    features,
    config?.overridePolicyBlock
  );

  let governorDecision: GovernorDecision = "DO_NOTHING";
  let candidateAction: InterventionAction | undefined = undefined;
  let reason = "No intervention needed.";
  let expectedHelpValue = 0.1;
  let actionPayload: DecisionTrace["actionPayload"] = undefined;
  let outcome: DecisionTrace["outcome"] = "NO_INTERVENTION";

  if (!policyResult.allowed) {
    governorDecision = "DO_NOTHING";
    reason = policyResult.reason;
    outcome = policyResult.status === "BLOCKED" ? "BLOCKED_BY_POLICY" : "NO_INTERVENTION";
  } else if (frictionResult.friction === "NONE") {
    governorDecision = "DO_NOTHING";
    reason = "User progressing smoothly. Restraint applied (no unsolicited interruptions).";
    outcome = "NO_INTERVENTION";
  } else if (frictionResult.confidence < 0.65) {
    governorDecision = "WAIT";
    reason = `Friction detected (${frictionResult.friction}) but model confidence (${Math.round(frictionResult.confidence * 100)}%) is moderate. Gathering further signals.`;
    outcome = "NO_INTERVENTION";
  } else {
    // Determine action based on friction and intent
    if (frictionResult.friction === "DECISION_HESITATION" || intentResult.intent === "COMPARE") {
      governorDecision = "HELP";
      candidateAction = "COMPARE";
      expectedHelpValue = 0.88;
      reason = "Detected repeated alternation between options. Offering side-by-side comparative breakdown.";
      outcome = "INTERVENTION_OFFERED";

      const lastTwo = features.lastEntities.length >= 2 ? features.lastEntities.slice(-2) : ["Arsenal", "Liverpool"];
      actionPayload = {
        title: "Compare Options Side-by-Side",
        description: "You've been evaluating both teams. Would a side-by-side key metrics comparison help?",
        actionType: "COMPARE",
        entities: [
          {
            id: lastTwo[0] || "arsenal",
            name: lastTwo[0] || "Arsenal FC",
            details: { form: "W-W-D-W-W", xG: "2.14", possession: "61%", cleanSheets: 11 }
          },
          {
            id: lastTwo[1] || "liverpool",
            name: lastTwo[1] || "Liverpool FC",
            details: { form: "W-W-W-D-W", xG: "2.35", possession: "64%", cleanSheets: 13 }
          }
        ]
      };
    } else if (frictionResult.friction === "INFORMATION_OVERLOAD") {
      governorDecision = "HELP";
      candidateAction = "NARROW";
      expectedHelpValue = 0.82;
      reason = "Multiple markets reviewed with high scroll depth. Offering tailored filter to isolate top 3 relevant markets.";
      outcome = "INTERVENTION_OFFERED";
      actionPayload = {
        title: "Focus on Primary Markets",
        description: "There are 48 active markets. Would you like to filter to the top 3 most relevant?",
        actionType: "NARROW",
      };
    } else if (frictionResult.friction === "UNCERTAINTY" || frictionResult.friction === "NAVIGATION") {
      governorDecision = "HELP";
      candidateAction = "RESUME";
      expectedHelpValue = 0.79;
      reason = "Revisiting earlier event after backtracks. Offering direct resume.";
      outcome = "INTERVENTION_OFFERED";
      actionPayload = {
        title: `Resume ${features.activeEntityName || "Previous Match"}`,
        description: "Pick up where you left off with key match summaries.",
        actionType: "RESUME",
      };
    } else {
      governorDecision = "WAIT";
      reason = "Awaiting clearer trajectory signal.";
      outcome = "NO_INTERVENTION";
    }
  }

  const governorLatencyMs = Number((performance.now() - tGovStart).toFixed(2));
  const totalDecisionLatencyMs = Number((performance.now() - t0).toFixed(2));

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
    policyStatus: policyResult.status,
    policyReason: policyResult.reason,
    reason,
    expectedHelpValue,
    actionPayload,
    metrics: {
      eventProcessingLatencyMs: 0.12,
      featureCalculationLatencyMs,
      modelInferenceLatencyMs,
      governorLatencyMs,
      totalDecisionLatencyMs,
    },
    outcome,
  };
}
