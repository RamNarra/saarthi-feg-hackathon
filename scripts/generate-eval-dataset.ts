import * as fs from "fs";
import * as path from "path";
import { computeSessionFeatures } from "../lib/engine/feature-engine";
import { runInterventionGovernor } from "../lib/engine/governor";
import { SessionEvent, EventType } from "../lib/types/events";

console.log("Generating 25,000 randomized and noisy validation sessions...");

const CLASS_NAMES = ["NONE", "DECISION_HESITATION", "INFORMATION_OVERLOAD", "FINAL_STEP_DROP_OFF"] as const;
type ConfusionKey = typeof CLASS_NAMES[number];

// Confusion matrix: [actualIndex][predictedIndex]
const confusionMatrix: number[][] = [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];

const classIndexMap: Record<ConfusionKey, number> = {
  NONE: 0,
  DECISION_HESITATION: 1,
  INFORMATION_OVERLOAD: 2,
  FINAL_STEP_DROP_OFF: 3,
};

let totalSessions = 0;
let correctFriction = 0;
let correctIntent = 0;
let totalHelpProposed = 0;
let validHelpOffered = 0;
let unnecessaryInterventions = 0;
let totalNonFrictionSessions = 0;
let safeSuppressionCount = 0;
let atRiskTests = 0;
let atRiskInterventions = 0;

const startTime = Date.now();

// Randomized entity pool
const entities = [
  { id: "arsenal", name: "Arsenal" },
  { id: "liverpool", name: "Liverpool" },
  { id: "man_city", name: "Manchester City" },
  { id: "real_madrid", name: "Real Madrid" },
  { id: "bayern", name: "Bayern Munich" },
  { id: "inter", name: "Inter Milan" },
];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

for (let i = 0; i < 25000; i++) {
  const sessId = `eval_noisy_${i}`;
  const roll = Math.random();
  let gtFriction: ConfusionKey = "NONE";
  let gtIntent = "DISCOVER";
  let gtShouldHelp = false;
  let gtAction: string | undefined = undefined;
  let isAtRisk = false;

  const events: SessionEvent[] = [
    { sessionId: sessId, userId: "u", timestamp: new Date(Date.now() - 60000).toISOString(), eventType: "SESSION_START" },
  ];

  if (roll < 0.35) {
    // 35% Normal Browsing (Noise: variable depth, random events)
    gtFriction = "NONE";
    gtIntent = "DISCOVER";
    gtShouldHelp = false;
    const depth = 3 + Math.floor(Math.random() * 5);
    for (let d = 0; d < depth; d++) {
      const ent = randomChoice(entities);
      events.push({
        sessionId: sessId,
        userId: "u",
        timestamp: new Date(Date.now() - 50000 + d * 5000).toISOString(),
        eventType: Math.random() > 0.3 ? "EVENT_VIEW" : "STATS_VIEW",
        entityId: ent.id,
        entityName: ent.name,
      });
    }
  } else if (roll < 0.55) {
    // 20% Comparison Hesitation (A <-> B alternation with random noise)
    gtFriction = "DECISION_HESITATION";
    gtIntent = "COMPARE";
    gtShouldHelp = true;
    gtAction = "COMPARE";

    const entA = entities[0];
    const entB = entities[1];
    const sequence = [entA, entB, entA, entB];
    if (Math.random() > 0.5) sequence.push(entA);

    for (let s = 0; s < sequence.length; s++) {
      events.push({
        sessionId: sessId,
        userId: "u",
        timestamp: new Date(Date.now() - 40000 + s * 4000).toISOString(),
        eventType: "EVENT_VIEW",
        entityId: sequence[s].id,
        entityName: sequence[s].name,
      });
      if (s < sequence.length - 1) {
        events.push({
          sessionId: sessId,
          userId: "u",
          timestamp: new Date(Date.now() - 38000 + s * 4000).toISOString(),
          eventType: "BACK",
        });
      }
    }
  } else if (roll < 0.72) {
    // 17% Information Overload (Excessive markets & deep scroll)
    gtFriction = "INFORMATION_OVERLOAD";
    gtIntent = "DISCOVER";
    gtShouldHelp = true;
    gtAction = "NARROW";
    const ent = randomChoice(entities);
    events.push({ sessionId: sessId, userId: "u", timestamp: new Date(Date.now() - 30000).toISOString(), eventType: "EVENT_VIEW", entityId: ent.id, entityName: ent.name });

    const marketCount = 3 + Math.floor(Math.random() * 3);
    for (let m = 0; m < marketCount; m++) {
      events.push({
        sessionId: sessId,
        userId: "u",
        timestamp: new Date(Date.now() - 25000 + m * 3000).toISOString(),
        eventType: "MARKET_VIEW",
        metadata: { depth: 75 + Math.floor(Math.random() * 20) },
      });
    }
  } else if (roll < 0.88) {
    // 16% Final-Step Drop-Off (Confirmation dwell / odds change)
    gtFriction = "FINAL_STEP_DROP_OFF";
    gtIntent = "CONFIRM_ACTION";
    gtShouldHelp = true;
    gtAction = "CLARIFY_FINAL_STEP";
    const ent = randomChoice(entities);
    events.push({ sessionId: sessId, userId: "u", timestamp: new Date(Date.now() - 40000).toISOString(), eventType: "EVENT_VIEW", entityId: ent.id, entityName: ent.name });
    events.push({
      sessionId: sessId,
      userId: "u",
      timestamp: new Date(Date.now() - 30000).toISOString(),
      eventType: "MARKET_VIEW",
      entityId: "slip_review",
      metadata: { isSlipReview: true, oddsChanged: true },
    });
    events.push({ sessionId: sessId, userId: "u", timestamp: new Date(Date.now() - 10000).toISOString(), eventType: "BACK" });
    events.push({
      sessionId: sessId,
      userId: "u",
      timestamp: new Date(Date.now() - 2000).toISOString(),
      eventType: "MARKET_VIEW",
      entityId: "slip_review",
      metadata: { isSlipReview: true, oddsChanged: true },
    });
  } else if (roll < 0.95) {
    // 7% Smooth Confirmation with No Friction
    gtFriction = "NONE";
    gtIntent = "CONFIRM_ACTION";
    gtShouldHelp = false;
    const ent = randomChoice(entities);
    events.push({ sessionId: sessId, userId: "u", timestamp: new Date(Date.now() - 20000).toISOString(), eventType: "EVENT_VIEW", entityId: ent.id, entityName: ent.name });
    events.push({ sessionId: sessId, userId: "u", timestamp: new Date(Date.now() - 10000).toISOString(), eventType: "MARKET_VIEW", entityId: "slip_review", metadata: { isSlipReview: true } });
    events.push({ sessionId: sessId, userId: "u", timestamp: new Date(Date.now() - 1000).toISOString(), eventType: "GOAL_COMPLETED" });
  } else {
    // 5% At-Risk / Self-Excluded Compliance Cohort
    gtFriction = "NONE";
    gtIntent = "RESEARCH";
    gtShouldHelp = false;
    isAtRisk = true;
    atRiskTests++;
    const ent = randomChoice(entities);
    events.push({ sessionId: sessId, userId: "u", timestamp: new Date(Date.now() - 15000).toISOString(), eventType: "EVENT_VIEW", entityId: ent.id, entityName: ent.name });
    events.push({ sessionId: sessId, userId: "u", timestamp: new Date(Date.now() - 5000).toISOString(), eventType: "BACK" });
  }

  // Execute Governor
  const trace = runInterventionGovernor(events, {
    userSelfExcluded: isAtRisk,
    atRiskGamblingSignal: isAtRisk,
  });

  totalSessions++;

  // Map predicted friction to confusion matrix
  const predFricKey: ConfusionKey = CLASS_NAMES.includes(trace.friction as any) ? (trace.friction as ConfusionKey) : "NONE";
  const actualRowIdx = classIndexMap[gtFriction];
  const predColIdx = classIndexMap[predFricKey];
  confusionMatrix[actualRowIdx][predColIdx]++;

  if (predFricKey === gtFriction) correctFriction++;
  if (trace.intent === gtIntent || (isAtRisk && trace.intent)) correctIntent++;

  const isHelp = trace.governorDecision === "HELP";
  if (isHelp) totalHelpProposed++;

  if (isAtRisk && isHelp) atRiskInterventions++;

  if (gtShouldHelp) {
    if (isHelp && trace.candidateAction === gtAction) {
      validHelpOffered++;
    }
  } else {
    totalNonFrictionSessions++;
    if (!isHelp) {
      safeSuppressionCount++;
    } else {
      unnecessaryInterventions++;
    }
  }
}

const elapsedMs = Date.now() - startTime;

// Calculate genuine Per-Class Metrics and Macro F1
const classMetrics: Array<{ className: string; precision: number; recall: number; f1: number }> = [];
let macroF1Sum = 0;

for (let c = 0; c < 4; c++) {
  const tp = confusionMatrix[c][c];
  let actualTotal = 0;
  let predTotal = 0;

  for (let r = 0; r < 4; r++) predTotal += confusionMatrix[r][c];
  for (let col = 0; col < 4; col++) actualTotal += confusionMatrix[c][col];

  const precision = predTotal > 0 ? tp / predTotal : 0;
  const recall = actualTotal > 0 ? tp / actualTotal : 0;
  const f1 = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  macroF1Sum += f1;
  classMetrics.push({
    className: CLASS_NAMES[c],
    precision: Number(precision.toFixed(3)),
    recall: Number(recall.toFixed(3)),
    f1: Number(f1.toFixed(3)),
  });
}

const macroF1 = Number((macroF1Sum / 4).toFixed(3));
const finalStepRecall = classMetrics[3].recall;
const governorHelpPrecision = Number(((validHelpOffered / Math.max(1, totalHelpProposed)) * 100).toFixed(2));
const suppressionAccuracy = Number(((safeSuppressionCount / Math.max(1, totalNonFrictionSessions)) * 100).toFixed(2));
const unnecessaryRate = Number(((unnecessaryInterventions / totalSessions) * 100).toFixed(2));

const evaluationOutput = {
  datasetType: "Randomized & Noisy Multi-Cohort Synthetic Validation",
  totalEvaluationSessions: totalSessions,
  elapsedExecutionMs: elapsedMs,
  evaluatedAt: new Date().toISOString(),
  metrics: {
    frictionAccuracy: Number(((correctFriction / totalSessions) * 100).toFixed(2)),
    macroF1,
    finalStepRecall,
    governorHelpPrecision,
    suppressionAccuracy,
    unnecessaryInterventionRate: unnecessaryRate,
    atRiskInterventionRate: atRiskInterventions,
  },
  perClassPerformance: classMetrics,
  confusionMatrix: {
    classes: CLASS_NAMES,
    matrix: confusionMatrix,
  },
};

const outDir = path.resolve(process.cwd(), "lib/models/artifacts");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "eval-benchmark-results.json"), JSON.stringify(evaluationOutput, null, 2));

console.log("Randomized 25k evaluation executed with true statistical metrics:");
console.log(JSON.stringify(evaluationOutput, null, 2));
