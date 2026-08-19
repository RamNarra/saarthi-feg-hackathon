import { SessionEvent } from "../types/events";
import {
  SessionFeatures,
  StructuredSessionState,
  JourneyStage,
  FinalStepContext,
  InterventionAction,
} from "../types/models";

export function computeSessionFeatures(events: SessionEvent[]): SessionFeatures {
  const startTime = events.length > 0 ? new Date(events[0].timestamp).getTime() : Date.now();
  const lastTime = events.length > 0 ? new Date(events[events.length - 1].timestamp).getTime() : Date.now();
  const dwellTimeSeconds = Math.max(0, Math.round((lastTime - startTime) / 1000));

  const sessionDepth = events.length;
  let eventOpens = 0;
  let backtracks = 0;
  let comparisonCount = 0;
  let searchReformulations = 0;
  let marketSwitchingCount = 0;
  let priorInterventionDismissals = 0;
  let priorInterventionAcceptances = 0;
  let scrollCount = 0;
  let totalScroll = 0;
  let goalCompleted = false;

  // Final step tracking
  let slipOpenTime: number | null = null;
  let inConfirmation = false;
  let unacknowledgedChange = false;
  let finalStepBacktracks = 0;
  let confirmationViews = 0;

  const entitySequence: string[] = [];
  const entityNameMap = new Map<string, string>();
  const entityVisitCounts = new Map<string, number>();
  const entityLastVisitTime = new Map<string, number>();
  const interventionHistory: Array<{ action: InterventionAction; outcome: string; timestamp: string }> = [];

  let lastMeaningfulActionTime = startTime;
  let activeEntity: string | undefined;
  let activeEntityName: string | undefined;
  let activeCategory: string | undefined;

  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    const evTime = new Date(ev.timestamp).getTime();

    if (ev.eventType === "EVENT_VIEW") {
      eventOpens++;
      lastMeaningfulActionTime = evTime;
      if (ev.entityId) {
        entitySequence.push(ev.entityId);
        activeEntity = ev.entityId;
        if (ev.entityName) {
          activeEntityName = ev.entityName;
          entityNameMap.set(ev.entityId, ev.entityName);
        }
        entityVisitCounts.set(ev.entityId, (entityVisitCounts.get(ev.entityId) || 0) + 1);
        entityLastVisitTime.set(ev.entityId, evTime);
      }
    } else if (ev.eventType === "BACK") {
      backtracks++;
      if (inConfirmation) {
        finalStepBacktracks++;
        inConfirmation = false;
      }
    } else if (ev.eventType === "COMPARE") {
      comparisonCount++;
      lastMeaningfulActionTime = evTime;
    } else if (ev.eventType === "SEARCH") {
      searchReformulations++;
      lastMeaningfulActionTime = evTime;
    } else if (ev.eventType === "MARKET_VIEW") {
      marketSwitchingCount++;
      lastMeaningfulActionTime = evTime;
    } else if (ev.eventType === "SCROLL") {
      scrollCount++;
      const depth = typeof ev.metadata?.depth === "number" ? ev.metadata.depth : 50;
      totalScroll += depth;
    } else if (ev.eventType === "INTERVENTION_DISMISSED") {
      priorInterventionDismissals++;
      interventionHistory.push({
        action: (ev.metadata?.actionType as InterventionAction) || "COMPARE",
        outcome: "DISMISSED",
        timestamp: ev.timestamp,
      });
    } else if (ev.eventType === "INTERVENTION_ACCEPTED") {
      priorInterventionAcceptances++;
      interventionHistory.push({
        action: (ev.metadata?.actionType as InterventionAction) || "COMPARE",
        outcome: "ACCEPTED",
        timestamp: ev.timestamp,
      });
    } else if (ev.eventType === "GOAL_COMPLETED") {
      goalCompleted = true;
    }

    // Explicit final step signal detection
    if (ev.eventType === "MARKET_VIEW" && (ev.metadata?.isSlipReview || ev.entityId?.includes("slip") || ev.entityId?.includes("confirm"))) {
      inConfirmation = true;
      confirmationViews++;
      if (!slipOpenTime) slipOpenTime = evTime;
    }
    if (ev.metadata?.oddsChanged || ev.metadata?.marketChanged) {
      unacknowledgedChange = true;
    }

    if (ev.metadata?.sport) {
      activeCategory = String(ev.metadata.sport);
    }
  }

  const uniqueEntities = Array.from(entityVisitCounts.keys());
  const uniqueEntitiesCount = uniqueEntities.length;
  let repeatedEntityViews = 0;
  let repeatedRevisits = 0;

  for (const count of entityVisitCounts.values()) {
    if (count > 1) {
      repeatedEntityViews += count - 1;
      repeatedRevisits += count;
    }
  }

  // Alternation score detection: e.g. A -> B -> A -> B
  let alternationScore = 0;
  if (entitySequence.length >= 3) {
    const seq = entitySequence.slice(-6);
    for (let i = 0; i < seq.length - 2; i++) {
      if (seq[i] === seq[i + 2] && seq[i] !== seq[i + 1]) {
        alternationScore += 0.45;
      }
    }
    if (uniqueEntitiesCount === 2 && entitySequence.length >= 4) {
      alternationScore = Math.max(alternationScore, 0.6);
    }
    alternationScore = Math.min(1.0, alternationScore);
  }

  // Hesitation score: backtracks + repeat views + high dwell time relative to actions
  let hesitationScore = 0;
  if (backtracks >= 2) hesitationScore += 0.35;
  if (repeatedEntityViews >= 2) hesitationScore += 0.45;
  if (dwellTimeSeconds > 20 && sessionDepth >= 5) hesitationScore += 0.3;
  hesitationScore = Math.min(1.0, hesitationScore);

  // Final-step drop-off hesitation score
  let finalStepHesitationScore = 0;
  const timeInConfirmationSec = slipOpenTime ? Math.max(0, Math.round((lastTime - slipOpenTime) / 1000)) : 0;
  const hesitationSignals: string[] = [];

  if (inConfirmation || confirmationViews > 0) {
    if (timeInConfirmationSec > 15) {
      finalStepHesitationScore += 0.50;
      hesitationSignals.push("Extended dwell at confirmation screen (>15s)");
    }
    if (unacknowledgedChange) {
      finalStepHesitationScore += 0.40;
      hesitationSignals.push("Unacknowledged market or odds adjustment detected");
    }
    if (finalStepBacktracks > 0) {
      finalStepHesitationScore += 0.45;
      hesitationSignals.push("Backtrack from confirmation back to browsing");
    }
  }
  finalStepHesitationScore = Math.min(1.0, finalStepHesitationScore);

  const contentDiversityRatio = sessionDepth > 0 ? Number((uniqueEntitiesCount / Math.max(1, eventOpens)).toFixed(2)) : 1.0;
  const timeSinceMeaningfulActionSec = Math.max(0, Math.round((lastTime - lastMeaningfulActionTime) / 1000));
  const scrollDepthAvg = scrollCount > 0 ? Math.round(totalScroll / scrollCount) : 0;

  // Active Entities Map
  const activeEntities = uniqueEntities.map((id) => ({
    id,
    name: entityNameMap.get(id) || id,
    visitCount: entityVisitCounts.get(id) || 1,
    lastVisitedSecAgo: Math.max(0, Math.round((lastTime - (entityLastVisitTime.get(id) || lastTime)) / 1000)),
  }));

  // Identify top comparison pair if any
  const comparisonSet: Array<{ id: string; name: string }> = [];
  if (alternationScore >= 0.35 || (uniqueEntitiesCount === 2 && repeatedEntityViews >= 1)) {
    for (const ent of activeEntities.slice(0, 2)) {
      comparisonSet.push({ id: ent.id, name: ent.name });
    }
  }

  // 7-Stage Journey Progression Engine
  let journeyStage: JourneyStage = "DISCOVERY";
  if (goalCompleted) {
    journeyStage = "POST_ACTION";
  } else if (inConfirmation || confirmationViews > 0) {
    journeyStage = "CONFIRMATION";
  } else if (comparisonSet.length === 2 && alternationScore >= 0.35) {
    journeyStage = "COMPARISON";
  } else if (marketSwitchingCount >= 2 || repeatedEntityViews >= 1) {
    journeyStage = "CONVERGENCE";
  } else if (eventOpens >= 2 || scrollCount >= 2) {
    journeyStage = "EVALUATION";
  }

  // Infer Session Goal
  let inferredGoal = "Exploring premier matchups and live markets";
  if (inConfirmation) {
    inferredGoal = `Reviewing final selection confirmation for ${activeEntityName || "Selected Match"}`;
  } else if (comparisonSet.length === 2) {
    inferredGoal = `Comparing head-to-head metrics for ${comparisonSet[0].name} vs ${comparisonSet[1].name}`;
  } else if (activeEntityName && marketSwitchingCount >= 2) {
    inferredGoal = `Evaluating market options for ${activeEntityName}`;
  }

  const finalStepContext: FinalStepContext = {
    stepName: inConfirmation ? (unacknowledgedChange ? "ODDS_CHANGED" : "CONFIRMATION_PENDING") : "NONE",
    timeInConfirmationSec,
    unacknowledgedChange,
    hesitationSignals,
  };

  const structuredState: StructuredSessionState = {
    journeyStage,
    activeEntities,
    comparisonSet,
    inferredGoal,
    finalStepContext,
    frictionHistory: [],
    interventionHistory,
  };

  return {
    sessionDepth,
    dwellTimeSeconds,
    eventOpens,
    uniqueEntitiesCount,
    repeatedEntityViews,
    backtracks,
    comparisonCount,
    searchReformulations,
    marketSwitchingCount,
    scrollDepthAvg,
    timeSinceMeaningfulActionSec,
    repeatedRevisits,
    contentDiversityRatio,
    priorInterventionDismissals,
    priorInterventionAcceptances,
    alternationScore: Number(alternationScore.toFixed(2)),
    hesitationScore: Number(hesitationScore.toFixed(2)),
    finalStepHesitationScore: Number(finalStepHesitationScore.toFixed(2)),
    lastEntities: entitySequence.slice(-4),
    activeEntity,
    activeEntityName,
    activeCategory,
    structuredState,
  };
}
