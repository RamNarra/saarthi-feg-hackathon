import { SessionEvent } from "../types/events";
import { SessionFeatures } from "../types/models";

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

  const entitySequence: string[] = [];
  const entityNameMap = new Map<string, string>();
  const entityVisitCounts = new Map<string, number>();

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
      }
    } else if (ev.eventType === "BACK") {
      backtracks++;
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
    } else if (ev.eventType === "INTERVENTION_ACCEPTED") {
      priorInterventionAcceptances++;
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

  // Alternation score detection: e.g. A -> B -> A -> B or repeated switching between 2 distinct entities
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

  const contentDiversityRatio = sessionDepth > 0 ? Number((uniqueEntitiesCount / Math.max(1, eventOpens)).toFixed(2)) : 1.0;
  const timeSinceMeaningfulActionSec = Math.max(0, Math.round((lastTime - lastMeaningfulActionTime) / 1000));
  const scrollDepthAvg = scrollCount > 0 ? Math.round(totalScroll / scrollCount) : 0;

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
    lastEntities: entitySequence.slice(-4),
    activeEntity,
    activeEntityName,
    activeCategory,
  };
}
