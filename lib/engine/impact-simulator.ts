export interface ImpactModelInputs {
  monthlyActiveSessions: number; // e.g. 1,000,000
  baselineSessionConversion: number; // e.g. 0.28 (28%)
  baselineFinalStepConversion: number; // e.g. 0.62 (62%)
  averageValuePerConvertedSessionEur: number; // e.g. €24.50
  frictionSessionProportion: number; // e.g. 0.35 (35% of sessions exhibit friction)
  saarthiFrictionResolutionRate: number; // e.g. 0.42 (42% of friction sessions converted into helpful resolution)
  finalStepDropOffInterventionCoverage: number; // e.g. 0.65 (65% of checkout drop-off sessions receive clarification)
  finalStepResolutionUplift: number; // e.g. 0.18 (+18% relative uplift in confirmation completion)
  estimatedD30RetentionUplift: number; // e.g. 0.042 (+4.2% relative D30 retention from trust & reduced drop-off)
}

export interface ImpactModelOutputs {
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
}

export function calculateBusinessImpact(inputs: ImpactModelInputs): ImpactModelOutputs {
  const baselineTotalConversions = Math.round(inputs.monthlyActiveSessions * inputs.baselineSessionConversion);
  const baselineTotalValueEur = baselineTotalConversions * inputs.averageValuePerConvertedSessionEur;

  // 1. Discovery & Evaluation Friction Uplift
  const frictionSessions = inputs.monthlyActiveSessions * inputs.frictionSessionProportion;
  const incrementalFromDiscovery = frictionSessions * inputs.saarthiFrictionResolutionRate * (inputs.baselineSessionConversion * 0.45);

  // 2. Final-Step Drop-Off Uplift
  const confirmationSessions = inputs.monthlyActiveSessions * 0.40; // ~40% reach confirmation intent
  const confirmationDropOffs = confirmationSessions * (1 - inputs.baselineFinalStepConversion);
  const incrementalFromFinalStep = confirmationDropOffs * inputs.finalStepDropOffInterventionCoverage * inputs.finalStepResolutionUplift;

  const totalIncrementalConversions = Math.round(incrementalFromDiscovery + incrementalFromFinalStep);
  const saarthiTotalConversions = baselineTotalConversions + totalIncrementalConversions;
  const incrementalValueEur = totalIncrementalConversions * inputs.averageValuePerConvertedSessionEur;
  const saarthiTotalValueEur = baselineTotalValueEur + incrementalValueEur;

  const upliftPercentage = Number(((incrementalValueEur / baselineTotalValueEur) * 100).toFixed(2));
  const newSessionConversionRate = Number(((saarthiTotalConversions / inputs.monthlyActiveSessions) * 100).toFixed(2));
  const newFinalStepConversionRate = Number(((inputs.baselineFinalStepConversion + (inputs.finalStepResolutionUplift * 0.40)) * 100).toFixed(2));

  // Infrastructure cost (Edge execution: ~€0.00008 per session evaluation)
  const estimatedInfrastructureCostEur = Math.round(inputs.monthlyActiveSessions * 0.00008);
  const netValueGeneratedEur = incrementalValueEur - estimatedInfrastructureCostEur;
  const estimatedRoiMultiplier = Number((netValueGeneratedEur / Math.max(1, estimatedInfrastructureCostEur)).toFixed(1));

  const d30RetentionImpact = `+${(inputs.estimatedD30RetentionUplift * 100).toFixed(1)}% (Estimated D30 cohort retention uplift under zero-pressure policy)`;

  return {
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
  };
}
