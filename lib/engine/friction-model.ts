import { SessionFeatures, FrictionType } from "../types/models";

export interface FrictionPrediction {
  friction: FrictionType;
  confidence: number;
  distribution: Record<FrictionType, number>;
  signals: string[];
  latencyMs: number;
}

export function predictSessionFriction(features: SessionFeatures): FrictionPrediction {
  const start = performance.now();
  const signals: string[] = [];

  const logits: Record<FrictionType, number> = {
    NONE: 1.0,
    INFORMATION_OVERLOAD: 0.1,
    NAVIGATION: 0.1,
    UNCERTAINTY: 0.1,
    DISCOVERY: 0.1,
    DECISION_HESITATION: 0.1,
  };

  // Signal 1: Alternation between two entities (e.g. Arsenal vs Liverpool)
  if (features.alternationScore >= 0.35 || (features.uniqueEntitiesCount === 2 && features.repeatedEntityViews >= 2)) {
    logits.DECISION_HESITATION += 3.5;
    logits.NONE = 0.05;
    signals.push("Repeated rapid alternation between 2 entities");
  }

  // Signal 2: Navigation loop (rapid backtracking)
  if (features.backtracks >= 3 && features.alternationScore < 0.35) {
    logits.NAVIGATION += 2.8;
    logits.NONE = 0.1;
    signals.push(`High backtrack frequency (${features.backtracks} back navigations)`);
  }

  // Signal 3: Search reformulation
  if (features.searchReformulations >= 3) {
    logits.DISCOVERY += 2.6;
    logits.NONE = 0.1;
    signals.push("Multiple search query reformulations");
  }

  // Signal 4: Information overload (high dwell + market switches + scroll with no action)
  if (features.marketSwitchingCount >= 4 && features.scrollDepthAvg > 70) {
    logits.INFORMATION_OVERLOAD += 2.7;
    logits.NONE = 0.1;
    signals.push("High market switching with deep scrolling without selection");
  }

  // Signal 5: Uncertainty / hesitation (dwell time > 30s with repeated revisits)
  if (features.repeatedEntityViews >= 2 && features.dwellTimeSeconds > 25 && logits.DECISION_HESITATION < 2.0) {
    logits.UNCERTAINTY += 2.4;
    logits.NONE = 0.1;
    signals.push("Revisiting previously viewed entity with extended dwell time");
  }

  // Normal fluent browsing
  if (signals.length === 0) {
    logits.NONE = 4.0;
    signals.push("Normal browsing trajectory, no persistent friction detected");
  }

  // Softmax with temperature
  const expScores: Record<FrictionType, number> = {} as any;
  let sumExp = 0;
  for (const [key, val] of Object.entries(logits) as [FrictionType, number][]) {
    const e = Math.exp(val);
    expScores[key] = e;
    sumExp += e;
  }

  let maxScore = -Infinity;
  let predictedFriction: FrictionType = "NONE";

  const distribution: Record<FrictionType, number> = {
    NONE: 0,
    INFORMATION_OVERLOAD: 0,
    NAVIGATION: 0,
    UNCERTAINTY: 0,
    DISCOVERY: 0,
    DECISION_HESITATION: 0,
  };

  for (const [key, val] of Object.entries(expScores) as [FrictionType, number][]) {
    const prob = Number((val / sumExp).toFixed(3));
    distribution[key] = prob;
    if (prob > maxScore) {
      maxScore = prob;
      predictedFriction = key;
    }
  }

  const latencyMs = Number((performance.now() - start).toFixed(2));

  return {
    friction: predictedFriction,
    confidence: maxScore,
    distribution,
    signals,
    latencyMs,
  };
}
