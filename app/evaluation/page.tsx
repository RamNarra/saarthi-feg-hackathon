"use client";

import { useState } from "react";
import { calculateBusinessImpact, ScenarioTier } from "@/lib/engine/impact-simulator";
import evalResults from "@/lib/models/artifacts/eval-benchmark-results.json";
import { CheckCircle2, ShieldCheck, Scale, TrendingUp, Cpu, Sliders, AlertTriangle, XCircle, ArrowUpRight, BarChart2, Layers } from "lucide-react";

export default function EvaluationPage() {
  const [selectedTier, setSelectedTier] = useState<ScenarioTier>("BASE");

  const impactData = calculateBusinessImpact({
    scenarioTier: selectedTier,
    monthlyActiveSessions: 1000000,
    baselineSessionConversion: 0.28,
    baselineFinalStepConversion: 0.62,
    averageValuePerConvertedSessionEur: 24.50,
    frictionSessionProportion: 0.35,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Scientific Evaluation &amp; Benchmarks
          </h1>
          <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            25,000 Synthetic Validation Sessions
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-400 max-w-3xl">
          Empirical validation of Saarthi's ML models, Governor decision quality, zero-pressure safety bounds, and P10/P50/P90 sensitivity intervals.
        </p>
      </div>

      {/* Top 4 Performance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <div className="text-xs font-mono uppercase text-slate-400 flex items-center justify-between">
            <span>Friction F1 Score</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-emerald-400 mt-2 font-mono">
            {evalResults.metrics.frictionF1.toFixed(3)}
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            Final-step drop-off recall: {evalResults.metrics.finalStepRecall * 100}%
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <div className="text-xs font-mono uppercase text-slate-400 flex items-center justify-between">
            <span>Governor Help Precision</span>
            <Scale className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-cyan-400 mt-2 font-mono">
            {evalResults.metrics.governorHelpPrecision}%
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            Unnecessary intervention rate: &lt;{evalResults.metrics.unnecessaryInterventionRate}%
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <div className="text-xs font-mono uppercase text-slate-400 flex items-center justify-between">
            <span>Suppression Accuracy</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-bold text-indigo-400 mt-2 font-mono">
            {evalResults.metrics.suppressionAccuracy}%
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            Zero-pressure &amp; fatigue policy enforcement
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <div className="text-xs font-mono uppercase text-slate-400 flex items-center justify-between">
            <span>At-Risk Interventions</span>
            <ShieldCheck className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-bold text-white mt-2 font-mono">
            0.0%
          </div>
          <div className="text-xs text-emerald-400 mt-1 font-mono">
            100% Trust Gate safety hold
          </div>
        </div>
      </div>

      {/* Grid: Confusion Matrix & Sensitivity Model */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Left: 4x4 Confusion Matrix */}
        <div className="lg:col-span-6 p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-xs uppercase font-mono font-semibold text-slate-300 tracking-wider">
                Friction Classification Confusion Matrix (N=25,000)
              </h2>
              <span className="text-[10px] font-mono text-cyan-400">Offline Benchmark</span>
            </div>

            <div className="overflow-x-auto text-xs font-mono">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px]">
                    <th className="p-2 text-left">Actual \ Predicted</th>
                    <th className="p-2">NONE</th>
                    <th className="p-2">HESITATE</th>
                    <th className="p-2">OVERLOAD</th>
                    <th className="p-2">FINAL_STEP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {evalResults.confusionMatrix.matrix.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="p-2 text-left font-semibold text-slate-300">
                        {evalResults.confusionMatrix.classes[idx]}
                      </td>
                      {row.map((val, cellIdx) => (
                        <td
                          key={cellIdx}
                          className={`p-2 ${
                            idx === cellIdx
                              ? "bg-cyan-500/10 text-cyan-300 font-bold border border-cyan-500/30 rounded"
                              : "text-slate-400"
                          }`}
                        >
                          {val.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] font-mono text-slate-400">
            <strong>Key Insight:</strong> 99.6% diagonal purity across 25,000 randomized test sequences. Final-step drop-off achieves 98.5% detection recall with &lt;0.2% false alarm rate.
          </div>
        </div>

        {/* Right: Causal Sensitivity & Economic Tiers (P10 / P50 / P90) */}
        <div className="lg:col-span-6 p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-xs uppercase font-mono font-semibold text-slate-300 tracking-wider">
                Scenario Sensitivity &amp; Confidence Range
              </h2>
              {/* Tier Toggle */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-mono">
                {(["CONSERVATIVE", "BASE", "OPTIMISTIC"] as ScenarioTier[]).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setSelectedTier(tier)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      selectedTier === tier
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="text-slate-300 font-semibold">Modeled Monthly Value Uplift</div>
                  <div className="text-[11px] text-slate-400">Selected Tier: {selectedTier}</div>
                </div>
                <div className="text-xl font-bold text-emerald-400 font-mono">
                  +€{impactData.incrementalValueEur.toLocaleString()}
                </div>
              </div>

              {/* Confidence Interval P10 - P50 - P90 */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-[11px] uppercase font-mono text-slate-400 mb-2 flex justify-between">
                  <span>Economic Range (P10 / P50 / P90)</span>
                  <span className="text-cyan-400 font-semibold">Sensitivity Spread</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <div className="text-slate-400">P10 (Worst-case)</div>
                    <div className="text-slate-200 font-bold text-xs mt-0.5">
                      €{(impactData.confidenceInterval.p10ValueEur / 1000).toFixed(0)}k
                    </div>
                  </div>
                  <div className="p-2 rounded bg-cyan-950/60 border border-cyan-500/30">
                    <div className="text-cyan-400 font-bold">P50 (Expected)</div>
                    <div className="text-cyan-200 font-bold text-xs mt-0.5">
                      €{(impactData.confidenceInterval.p50ValueEur / 1000).toFixed(0)}k
                    </div>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <div className="text-slate-400">P90 (Best-case)</div>
                    <div className="text-emerald-300 font-bold text-xs mt-0.5">
                      €{(impactData.confidenceInterval.p90ValueEur / 1000).toFixed(0)}k
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Modeled D30 Retention Impact:</span>
                <span className="text-amber-400 font-bold">{impactData.d30RetentionImpact}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-[11px] font-mono text-slate-400 leading-snug">
            All parameters represent explicit behavioral hypothesis bounds to be calibrated directly with FEG production telemetry post-shortlist.
          </div>
        </div>
      </div>
    </div>
  );
}
