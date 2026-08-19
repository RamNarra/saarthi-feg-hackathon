export type ScenarioTier = "CONSERVATIVE" | "BASE" | "OPTIMISTIC";

export interface ImpactModelInputs {
  scenarioTier: ScenarioTier;
  monthlyActiveSessions: number; // e.g. 1,000,000
  baselineSessionConversion: number; // e.g. 0.28 (28%)
  baselineFinalStepConversion: number; // e.g. 0.62 (62%)
  averageValuePerConvertedSessionEur: number; // e.g. €24.50
  frictionSessionProportion: number; // e.g. 0.35 (35%)
}

export interface ScenarioUpliftMultipliers {
  frictionResolutionRate: number; // Probability friction is resolved
  incrementalConversionLift: number; // Incremental lift on resolved sessions
  finalStepInterventionCoverage: number; // Drop-off coverage
  finalStepRecoveryLift: number; // Conversion uplift at confirmation
  d30RetentionLift: number; // Cohort retention proxy
}

export const SCENARIO_PRESETS: Record<ScenarioTier, ScenarioUpliftMultipliers> = {
  CONSERVATIVE: {
    frictionResolutionRate: 0.25,
    incrementalConversionLift: 0.025, // +2.5% incremental conversion
    finalStepInterventionCoverage: 0.45,
    finalStepRecoveryLift: 0.08, // +8% recovery at confirmation
    d30RetentionLift: 0.018, // +1.8% D30
  },
  BASE: {
    frictionResolutionRate: 0.42,
    incrementalConversionLift: 0.055, // +5.5% incremental conversion
    finalStepInterventionCoverage: 0.65,
    finalStepRecoveryLift: 0.16, // +16% recovery at confirmation
    d30RetentionLift: 0.042, // +4.2% D30
  },
  OPTIMISTIC: {
    frictionResolutionRate: 0.58,
    incrementalConversionLift: 0.095, // +9.5% incremental conversion
    finalStepInterventionCoverage: 0.80,
    finalStepRecoveryLift: 0.24, // +24% recovery at confirmation
    d30RetentionLift: 0.075, // +7.5% D30
  },
};

export interface ImpactModelOutputs {
  tier: ScenarioTier;
  baselineTotalConversions: number;
  baselineTotalValueEur: number;
  saarthiTotalConversions: number;
  saarthiTotalValueEur: number;
  incrementalConversions: number;
  incrementalValueEur: number;
  upliftPercentage: number;
  newSessionConversionRate: number;
  newFinalStepConversionRate: number;
  estimatedInfrastructureCostEur: number;
  netValueGeneratedEur: number;
  estimatedRoiMultiplier: number;
  d30RetentionImpact: string;
  confidenceInterval: {
    p10ValueEur: number;
    p50ValueEur: number;
    p90ValueEur: number;
  };
}

export function calculateBusinessImpact(inputs: ImpactModelInputs): ImpactModelOutputs {
  const preset = SCENARIO_PRESETS[inputs.scenarioTier] || SCENARIO_PRESETS.BASE;

  const baselineTotalConversions = Math.round(inputs.monthlyActiveSessions * inputs.baselineSessionConversion);
  const baselineTotalValueEur = baselineTotalConversions * inputs.averageValuePerConvertedSessionEur;

  // 1. Discovery Friction Uplift
  const frictionSessions = inputs.monthlyActiveSessions * inputs.frictionSessionProportion;
  const incrementalFromDiscovery = frictionSessions * preset.frictionResolutionRate * preset.incrementalConversionLift;

  // 2. Final-Step Drop-Off Uplift
  const confirmationSessions = inputs.monthlyActiveSessions * 0.38;
  const confirmationDropOffs = confirmationSessions * (1 - inputs.baselineFinalStepConversion);
  const incrementalFromFinalStep = confirmationDropOffs * preset.finalStepInterventionCoverage * preset.finalStepRecoveryLift;

  const totalIncrementalConversions = Math.round(incrementalFromDiscovery + incrementalFromFinalStep);
  const saarthiTotalConversions = baselineTotalConversions + totalIncrementalConversions;
  const incrementalValueEur = totalIncrementalConversions * inputs.averageValuePerConvertedSessionEur;
  const saarthiTotalValueEur = baselineTotalValueEur + incrementalValueEur;

  const upliftPercentage = Number(((incrementalValueEur / baselineTotalValueEur) * 100).toFixed(2));
  const newSessionConversionRate = Number(((saarthiTotalConversions / inputs.monthlyActiveSessions) * 100).toFixed(2));
  const newFinalStepConversionRate = Number(((inputs.baselineFinalStepConversion + (preset.finalStepRecoveryLift * 0.35)) * 100).toFixed(2));

  // Infrastructure cost (Edge execution: ~€0.00006 per evaluation)
  const estimatedInfrastructureCostEur = Math.round(inputs.monthlyActiveSessions * 0.00006);
  const netValueGeneratedEur = incrementalValueEur - estimatedInfrastructureCostEur;
  const estimatedRoiMultiplier = Number((netValueGeneratedEur / Math.max(1, estimatedInfrastructureCostEur)).toFixed(1));

  const d30RetentionImpact = `+${(preset.d30RetentionLift * 100).toFixed(1)}%`;

  // Causal sensitivity intervals (P10 / P50 / P90)
  const p10ValueEur = Math.round(incrementalValueEur * 0.65);
  const p50ValueEur = Math.round(incrementalValueEur);
  const p90ValueEur = Math.round(incrementalValueEur * 1.40);

  return {
    tier: inputs.scenarioTier,
    baselineTotalConversions,
    baselineTotalValueEur,
    saarthiTotalConversions,
    saarthiTotalValueEur,
    incrementalConversions: totalIncrementalConversions,
    incrementalValueEur,
    upliftPercentage,
    newSessionConversionRate,
    newFinalStepConversionRate,
    estimatedInfrastructureCostEur,
    netValueGeneratedEur,
    estimatedRoiMultiplier,
    d30RetentionImpact,
    confidenceInterval: {
      p10ValueEur,
      p50ValueEur,
      p90ValueEur,
    },
  };
}
