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

export interface StructuredSessionState {
  journeyStage: "EARLY_EXPLORATION" | "EVALUATION" | "ACTIVE_COMPARISON" | "CONVERGENCE" | "POST_INTERVENTION";
  activeEntities: Array<{ id: string; name: string; visitCount: number; lastVisitedSecAgo: number }>;
  comparisonSet: Array<{ id: string; name: string }>;
  inferredGoal: string;
  frictionHistory: Array<{ friction: FrictionType; confidence: number; timestamp: string }>;
  interventionHistory: Array<{ action: InterventionAction; outcome: string; timestamp: string }>;
}

export interface CandidateInterventionScore {
  action: InterventionAction;
  expectedUsefulness: number; // 0.0 - 1.0 (estimated probability of friction resolution)
  intrusionCost: number;      // 0.0 - 1.0 (cognitive cost / disruption to natural user flow)
  netUtilityScore: number;    // expectedUsefulness - intrusionCost - fatiguePenalty
  justification: string;
  payload: {
    title: string;
    description: string;
    actionType: InterventionAction;
    entities?: Array<{ id: string; name: string; details?: Record<string, any> }>;
    suggestedQuestions?: string[];
  };
}

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
  alternationScore: number;
  hesitationScore: number;
  lastEntities: string[];
  activeEntity?: string;
  activeEntityName?: string;
  activeCategory?: string;
  structuredState: StructuredSessionState;
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
  rankedCandidates: CandidateInterventionScore[];
  selectedUtility: number;
  intrusionCost: number;
  netUtilityScore: number;
  policyStatus: "ALLOWED" | "BLOCKED" | "SUPPRESSED";
  policyReason: string;
  reason: string;
  expectedHelpValue: number;
  structuredState: StructuredSessionState;
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
