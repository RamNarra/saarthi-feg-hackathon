import { z } from "zod";
import { SessionEvent } from "./events";

export const SessionIntentEnum = z.enum([
  "DISCOVER",
  "RESEARCH",
  "COMPARE",
  "FOLLOW",
  "READY_TO_ACT",
  "CONFIRM_ACTION",
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
  "FINAL_STEP_DROP_OFF",
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
  "CLARIFY_FINAL_STEP",
]);
export type InterventionAction = z.infer<typeof InterventionActionEnum>;

export const JourneyStageEnum = z.enum([
  "DISCOVERY",
  "EVALUATION",
  "COMPARISON",
  "CONVERGENCE",
  "CONFIRMATION",
  "COMPLETION",
  "POST_ACTION",
]);
export type JourneyStage = z.infer<typeof JourneyStageEnum>;

export interface FinalStepContext {
  stepName: "SELECTION_MADE" | "SLIP_REVIEW" | "CONFIRMATION_PENDING" | "ODDS_CHANGED" | "NONE";
  timeInConfirmationSec: number;
  unacknowledgedChange: boolean;
  hesitationSignals: string[];
}

export interface StructuredSessionState {
  journeyStage: JourneyStage;
  activeEntities: Array<{ id: string; name: string; visitCount: number; lastVisitedSecAgo: number }>;
  comparisonSet: Array<{ id: string; name: string }>;
  inferredGoal: string;
  finalStepContext: FinalStepContext;
  frictionHistory: Array<{ friction: FrictionType; confidence: number; timestamp: string }>;
  interventionHistory: Array<{ action: InterventionAction; outcome: string; timestamp: string }>;
}

export interface CandidateInterventionScore {
  action: InterventionAction;
  expectedUsefulness: number; // 0.0 - 1.0 (estimated probability of friction resolution)
  intrusionCost: number;      // 0.0 - 1.0 (cognitive cost / disruption to natural user flow)
  netUtilityScore: number;    // expectedUsefulness - intrusionCost - fatiguePenalty
  expectedSessionValue: number; // modeled Expected Session Value contribution
  justification: string;
  payload: {
    title: string;
    description: string;
    actionType: InterventionAction;
    entities?: Array<{ id: string; name: string; details?: Record<string, any> }>;
    suggestedQuestions?: string[];
    detailsSummary?: Record<string, any>;
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
  finalStepHesitationScore: number;
  lastEntities: string[];
  activeEntity?: string;
  activeEntityName?: string;
  activeCategory?: string;
  structuredState: StructuredSessionState;
}

export interface TrustGateResult {
  eligible: boolean;
  status: "ALLOWED" | "BLOCKED" | "SUPPRESSED";
  gateName: "RESPONSIBLE_PLAY" | "FATIGUE" | "CONFIRMATION_ZERO_PRESSURE" | "UNCERTAINTY" | "CONSENT_ELIGIBILITY";
  reason: string;
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
  expectedSessionValue: number;
  policyStatus: "ALLOWED" | "BLOCKED" | "SUPPRESSED";
  policyReason: string;
  trustGate: TrustGateResult;
  reason: string;
  expectedHelpValue: number;
  structuredState: StructuredSessionState;
  actionPayload?: {
    title: string;
    description: string;
    actionType: InterventionAction;
    entities?: Array<{ id: string; name: string; details?: Record<string, any> }>;
    suggestedQuestions?: string[];
    detailsSummary?: Record<string, any>;
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
