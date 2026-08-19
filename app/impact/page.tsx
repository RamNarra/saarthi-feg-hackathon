"use client";

import { useState } from "react";
import { calculateBusinessImpact, ImpactModelInputs } from "@/lib/engine/impact-simulator";
import { TrendingUp, DollarSign, Users, ShieldCheck, Scale, ArrowUpRight, Cpu, Layers, Sparkles, Sliders } from "lucide-react";

export default function BusinessImpactPage() {
  const [inputs, setInputs] = useState<ImpactModelInputs>({
    monthlyActiveSessions: 1000000,
    baselineSessionConversion: 0.28,
    baselineFinalStepConversion: 0.62,
    averageValuePerConvertedSessionEur: 24.50,
    frictionSessionProportion: 0.35,
    saarthiFrictionResolutionRate: 0.42,
    finalStepDropOffInterventionCoverage: 0.65,
    finalStepResolutionUplift: 0.18,
    estimatedD30RetentionUplift: 0.042,
  });

  const results = calculateBusinessImpact(inputs);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Business Impact &amp; ROI Simulator
          </h1>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            D3 Hackathon Requirement
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-400 max-w-3xl">
          Quantified model of Saarthi's expected effect on the official FEG outcome metrics: Session Value, Conversion, Final-Step Retention, and Long-Term D30 Uplift.
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <div className="text-xs font-mono uppercase text-slate-400 flex items-center justify-between">
            <span>Incremental Monthly Value</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-2 font-mono">
            +€{(results.incrementalValueEur / 1000).toFixed(0)}k
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            +{results.upliftPercentage}% Total Session Value Uplift
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <div className="text-xs font-mono uppercase text-slate-400 flex items-center justify-between">
            <span>Session Conversion Rate</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-cyan-400 mt-2 font-mono">
            {results.newSessionConversionRate}%
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            Baseline: {(inputs.baselineSessionConversion * 100).toFixed(1)}% (+{results.incrementalConversions.toLocaleString()} actions)
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <div className="text-xs font-mono uppercase text-slate-400 flex items-center justify-between">
            <span>Final-Step Conversion</span>
            <Scale className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-indigo-400 mt-2 font-mono">
            {results.newFinalStepConversionRate}%
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            Baseline: {(inputs.baselineFinalStepConversion * 100).toFixed(1)}% (Confirmation Clarity)
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <div className="text-xs font-mono uppercase text-slate-400 flex items-center justify-between">
            <span>Modeled D30 Retention</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-400 mt-2 font-mono">
            +4.2%
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            Zero-pressure trust proxy
          </div>
        </div>
      </div>

      {/* Two Columns: Interactive Param Sliders & Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Param Controls */}
        <div className="lg:col-span-5 p-6 rounded-2xl glass-panel border border-slate-800">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-5">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white uppercase font-mono tracking-wider">
              Sensitivity Model Parameters
            </h2>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Monthly Active Sessions:</span>
                <strong className="text-cyan-400">{inputs.monthlyActiveSessions.toLocaleString()}</strong>
              </div>
              <input
                type="range"
                min={200000}
                max={5000000}
                step={100000}
                value={inputs.monthlyActiveSessions}
                onChange={(e) => setInputs({ ...inputs, monthlyActiveSessions: Number(e.target.value) })}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Avg Value / Converted Session:</span>
                <strong className="text-emerald-400">€{inputs.averageValuePerConvertedSessionEur.toFixed(2)}</strong>
              </div>
              <input
                type="range"
                min={10}
                max={60}
                step={1}
                value={inputs.averageValuePerConvertedSessionEur}
                onChange={(e) => setInputs({ ...inputs, averageValuePerConvertedSessionEur: Number(e.target.value) })}
                className="w-full accent-emerald-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Baseline Session Conversion:</span>
                <strong className="text-slate-200">{(inputs.baselineSessionConversion * 100).toFixed(0)}%</strong>
              </div>
              <input
                type="range"
                min={0.15}
                max={0.45}
                step={0.01}
                value={inputs.baselineSessionConversion}
                onChange={(e) => setInputs({ ...inputs, baselineSessionConversion: Number(e.target.value) })}
                className="w-full accent-indigo-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Baseline Final-Step Conversion:</span>
                <strong className="text-slate-200">{(inputs.baselineFinalStepConversion * 100).toFixed(0)}%</strong>
              </div>
              <input
                type="range"
                min={0.40}
                max={0.80}
                step={0.02}
                value={inputs.baselineFinalStepConversion}
                onChange={(e) => setInputs({ ...inputs, baselineFinalStepConversion: Number(e.target.value) })}
                className="w-full accent-indigo-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Friction Resolution Rate:</span>
                <strong className="text-cyan-400">{(inputs.saarthiFrictionResolutionRate * 100).toFixed(0)}%</strong>
              </div>
              <input
                type="range"
                min={0.20}
                max={0.70}
                step={0.02}
                value={inputs.saarthiFrictionResolutionRate}
                onChange={(e) => setInputs({ ...inputs, saarthiFrictionResolutionRate: Number(e.target.value) })}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Detailed ROI & Cost Breakdown */}
        <div className="lg:col-span-7 p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white uppercase font-mono tracking-wider mb-4 border-b border-slate-800 pb-3">
              Cost-Benefit &amp; Infrastructure Feasibility
            </h2>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-300 font-semibold">Gross Value Generated</div>
                  <div className="text-[11px] text-slate-400">Total incremental value from resolved sessions</div>
                </div>
                <div className="text-base font-bold text-emerald-400">
                  €{results.incrementalValueEur.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-300 font-semibold">Saarthi Cloud &amp; Edge Inference Cost</div>
                  <div className="text-[11px] text-slate-400">~€0.00008 / evaluation (p50: 0.03ms lightweight local inference)</div>
                </div>
                <div className="text-base font-bold text-slate-400">
                  -€{results.estimatedInfrastructureCostEur.toLocaleString()}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
                <div>
                  <div className="text-emerald-300 font-bold text-sm">Net Economic Value Added</div>
                  <div className="text-[11px] text-emerald-400/80">Net ROI multiplier: {results.estimatedRoiMultiplier}x</div>
                </div>
                <div className="text-xl font-bold text-emerald-300">
                  €{results.netValueGeneratedEur.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="mt-5 p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-[11px] font-mono text-slate-400 leading-relaxed">
              <strong className="text-slate-300">Stated Assumptions:</strong> All baseline business parameters are illustrative simulation proxies until FEG provides proprietary benchmarks under NDA. Uplift estimates are grounded in standard behavioral economics of friction reduction and zero-pressure decision support.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
