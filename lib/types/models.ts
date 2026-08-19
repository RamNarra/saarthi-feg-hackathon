import { z } from "zod";
import { SessionEvent } from "./events";

export const SessionIntentEnum = z.enum([
  "DISCOVER",
  "RESEARCH",
  "COMPARE",
  "FOLLOW",
  "READY_TO_ACT",
  "UNKNOWN",
]);
export type SessionIntent = z.infer<typeof SessionIntentEnum>;

export const FrictionTypeEnum = z.enum([
  "NONE",
  "INFORMATION_OVERLOAD",
  "NAVIGATION",
  "UNCERTAINTY",
  "DISCOVERY",
  "DECISION_HESITATION",
]);
export type FrictionType = z.infer<typeof FrictionTypeEnum>;

export const GovernorDecisionEnum = z.enum([
  "HELP",
  "WAIT",
  "DO_NOTHING",
]);
export type GovernorDecision = z.infer<typeof GovernorDecisionEnum>;

export const InterventionActionEnum = z.enum([
  "COMPARE",
  "EXPLAIN",
  "NARROW",
  "RESUME",
  "ANSWER",
]);
export type InterventionAction = z.infer<typeof InterventionActionEnum>;

export interface SessionFeatures {
  sessionDepth: number;
  dwellTimeSeconds: number;
  eventOpens: number;
  uniqueEntitiesCount: number;
  repeatedEntityViews: number;
  backtracks: number;
  comparisonCount: number;
  searchReformulations: number;
  marketSwitchingCount: number;
  scrollDepthAvg: number;
  timeSinceMeaningfulActionSec: number;
  repeatedRevisits: number;
  contentDiversityRatio: number;
  priorInterventionDismissals: number;
  priorInterventionAcceptances: number;
  alternationScore: number; // e.g. A -> B -> A -> B pattern
  hesitationScore: number;
  lastEntities: string[];
  activeEntity?: string;
  activeEntityName?: string;
  activeCategory?: string;
}

export interface DecisionTrace {
  id: string;
  sessionId: string;
  timestamp: string;
  intent: SessionIntent;
  intentConfidence: number;
  friction: FrictionType;
  frictionConfidence: number;
  governorDecision: GovernorDecision;
  candidateAction?: InterventionAction;
  policyStatus: "ALLOWED" | "BLOCKED" | "SUPPRESSED";
  policyReason: string;
  reason: string;
  expectedHelpValue: number;
  actionPayload?: {
    title: string;
    description: string;
    actionType: InterventionAction;
    entities?: Array<{ id: string; name: string; details?: Record<string, any> }>;
    suggestedQuestions?: string[];
  };
  metrics: {
    eventProcessingLatencyMs: number;
    featureCalculationLatencyMs: number;
    modelInferenceLatencyMs: number;
    governorLatencyMs: number;
    totalDecisionLatencyMs: number;
  };
  outcome: "NO_INTERVENTION" | "INTERVENTION_OFFERED" | "INTERVENTION_ACCEPTED" | "INTERVENTION_DISMISSED" | "BLOCKED_BY_POLICY" | "GOAL_COMPLETED";
}

export interface ReconstructedTimelineItem {
  timestamp: string;
  label: string;
  eventType: string;
  details: string;
  decisionTrace?: DecisionTrace;
  badgeType?: "info" | "warning" | "success" | "neutral" | "danger";
}
