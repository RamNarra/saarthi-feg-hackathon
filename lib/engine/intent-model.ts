import { SessionFeatures, SessionIntent } from "../types/models";

export interface IntentPrediction {
  intent: SessionIntent;
  confidence: number;
  distribution: Record<SessionIntent, number>;
  latencyMs: number;
}

export function predictSessionIntent(features: SessionFeatures): IntentPrediction {
  const start = performance.now();

  const scores: Record<SessionIntent, number> = {
    DISCOVER: 0.1,
    RESEARCH: 0.1,
    COMPARE: 0.05,
    FOLLOW: 0.05,
    READY_TO_ACT: 0.05,
    UNKNOWN: 0.05,
  };

  if (features.sessionDepth <= 2 && features.eventOpens <= 1) {
    scores.DISCOVER += 0.7;
  } else if (features.alternationScore >= 0.35 || features.comparisonCount > 0 || (features.uniqueEntitiesCount === 2 && features.repeatedEntityViews >= 1)) {
    scores.COMPARE += 0.8;
  } else if (features.marketSwitchingCount >= 2 || features.dwellTimeSeconds > 20 || features.repeatedEntityViews >= 1) {
    scores.RESEARCH += 0.75;
  } else if (features.eventOpens >= 4 && features.uniqueEntitiesCount >= 3) {
    scores.DISCOVER += 0.65;
  } else {
    scores.RESEARCH += 0.45;
  }

  // Softmax normalization
  let maxScore = -Infinity;
  let predictedIntent: SessionIntent = "DISCOVER";

  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const distribution: Record<SessionIntent, number> = {
    DISCOVER: 0,
    RESEARCH: 0,
    COMPARE: 0,
    FOLLOW: 0,
    READY_TO_ACT: 0,
    UNKNOWN: 0,
  };

  for (const [key, val] of Object.entries(scores) as [SessionIntent, number][]) {
    const prob = Number((val / total).toFixed(3));
    distribution[key] = prob;
    if (prob > maxScore) {
      maxScore = prob;
      predictedIntent = key;
    }
  }

  const latencyMs = Number((performance.now() - start).toFixed(2));

  return {
    intent: predictedIntent,
    confidence: maxScore,
    distribution,
    latencyMs,
  };
}
