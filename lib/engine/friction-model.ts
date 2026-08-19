import { SessionFeatures, FrictionType } from "../types/models";
import modelArtifact from "../models/artifacts/friction_classifier.json";

export interface FrictionPrediction {
  friction: FrictionType;
  confidence: number;
  distribution: Record<FrictionType, number>;
  signals: string[];
  latencyMs: number;
  modelType: string;
}

export function predictSessionFriction(features: SessionFeatures): FrictionPrediction {
  const start = performance.now();
  const signals: string[] = [];

  // 1. Extract feature vector matching training schema:
  // [session_depth, dwell_time_sec, event_opens, unique_entities, repeated_entity_views, backtracks, market_switching, scroll_depth_avg, alternation_score]
  const rawFeatures = [
    features.sessionDepth,
    features.dwellTimeSeconds,
    features.eventOpens,
    features.uniqueEntitiesCount,
    features.repeatedEntityViews,
    features.backtracks,
    features.marketSwitchingCount,
    features.scrollDepthAvg,
    features.alternationScore,
  ];

  // 2. Identify observable sequence signals for explainability
  if (features.alternationScore >= 0.35 || (features.uniqueEntitiesCount === 2 && features.repeatedEntityViews >= 2)) {
    signals.push("Observable sequence: Repeated alternation between 2 distinct entities");
  }
  if (features.backtracks >= 3) {
    signals.push(`Observable sequence: Navigation backtrack loop (${features.backtracks} back clicks)`);
  }
  if (features.searchReformulations >= 3) {
    signals.push("Observable sequence: Search query reformulation cycle");
  }
  if (features.marketSwitchingCount >= 4 && features.scrollDepthAvg > 70) {
    signals.push("Observable sequence: Broad market switching with high scroll depth without selection");
  }
  if (features.repeatedEntityViews >= 2 && features.dwellTimeSeconds > 25) {
    signals.push("Observable sequence: Extended dwell time upon revisiting previously viewed match");
  }
  if (signals.length === 0) {
    signals.push("Observable sequence: Fluent linear navigation, no persistent bottleneck signals");
  }

  // 3. Learned Model Inference (Trained Logistic Regression with L2 regularization)
  const { feature_mean, feature_std, weights, bias, classes } = modelArtifact;
  const normalizedFeatures = rawFeatures.map((val, idx) => (val - feature_mean[idx]) / (feature_std[idx] || 1));

  // Compute logits: W^T * X + b
  const numClasses = classes.length;
  const logits = new Array(numClasses).fill(0);
  for (let c = 0; c < numClasses; c++) {
    let logit = bias[c];
    for (let f = 0; f < rawFeatures.length; f++) {
      logit += normalizedFeatures[f] * weights[f][c];
    }
    logits[c] = logit;
  }

  // Softmax
  const maxLogit = Math.max(...logits);
  const expScores = logits.map((l) => Math.exp(l - maxLogit));
  const sumExp = expScores.reduce((a, b) => a + b, 0);
  const probs = expScores.map((e) => e / sumExp);

  let maxProb = -Infinity;
  let predictedIndex = 0;

  const distribution: Record<FrictionType, number> = {
    NONE: 0,
    INFORMATION_OVERLOAD: 0,
    NAVIGATION: 0,
    UNCERTAINTY: 0,
    DISCOVERY: 0,
    DECISION_HESITATION: 0,
  };

  for (let c = 0; c < numClasses; c++) {
    const clsName = classes[c] as FrictionType;
    const p = Number(probs[c].toFixed(3));
    distribution[clsName] = p;
    if (p > maxProb) {
      maxProb = p;
      predictedIndex = c;
    }
  }

  const latencyMs = Number((performance.now() - start).toFixed(3));

  return {
    friction: classes[predictedIndex] as FrictionType,
    confidence: maxProb,
    distribution,
    signals,
    latencyMs,
    modelType: "Trained Multinomial Logistic Regression (L2-reg)",
  };
}
