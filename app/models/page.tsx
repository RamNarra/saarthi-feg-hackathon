"use client";

import { Cpu, CheckCircle2, Zap, Layers, BarChart3, AlertCircle } from "lucide-react";

export default function ModelsPage() {
  const featureWeights = [
    { name: "alternationScore (A⇄B loops)", importance: "0.34", category: "Sequence Flow" },
    { name: "backtracks (Return clicks)", importance: "0.22", category: "Navigation" },
    { name: "repeatedEntityViews", importance: "0.19", category: "Entity Focus" },
    { name: "marketSwitchingCount", importance: "0.14", category: "Information Depth" },
    { name: "dwellTimeSeconds", importance: "0.11", category: "Dwell / Pace" },
  ];

  const intentClasses = [
    { label: "DISCOVER", description: "Browsing leagues, broad catalogs, sports categories", baselineP: "24%" },
    { label: "RESEARCH", description: "Deep diving into statistics, head-to-head records, squad injury news", baselineP: "38%" },
    { label: "COMPARE", description: "Alternating between two matches or teams, evaluating competing markets", baselineP: "22%" },
    { label: "FOLLOW", description: "Tracking ongoing live events, score updates, favorite team notifications", baselineP: "10%" },
    { label: "READY_TO_ACT", description: "High confidence selection, user nearing final decision", baselineP: "6%" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Model Diagnostics & Inference Engine</h1>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Deterministic + ML
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-400">
          Architecture, feature importance weights, calibrated confidence scoring, and model card specifications.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Intent & Friction Models (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-2xl glass-panel border border-slate-800">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase">1. In-Session Intent Classifier</h3>
            </div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Maps real-time behavioral features to 5 primary in-session intent states with softmax probability distributions.
            </p>

            <div className="space-y-2.5">
              {intentClasses.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-cyan-300">{item.label}</span>
                    <span className="text-slate-400">{item.baselineP} baseline</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 font-sans">{item.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-slate-800">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase">2. Friction Detection Model</h3>
            </div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Detects 5 friction topologies via sequence pattern matching and calibrated logit scoring:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300">
                <span className="text-amber-400 font-bold">DECISION_HESITATION</span>
                <p className="text-[10px] text-slate-400 mt-1 font-sans">A⇄B alternation &amp; repeated market views</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300">
                <span className="text-indigo-400 font-bold">INFORMATION_OVERLOAD</span>
                <p className="text-[10px] text-slate-400 mt-1 font-sans">High dwell + deep scroll across multiple markets</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300">
                <span className="text-emerald-400 font-bold">NAVIGATION</span>
                <p className="text-[10px] text-slate-400 mt-1 font-sans">Repeated backtrack loops</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300">
                <span className="text-rose-400 font-bold">UNCERTAINTY</span>
                <p className="text-[10px] text-slate-400 mt-1 font-sans">Dwell without action on viewed entity</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Feature Weights & Inference Specs (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-2xl glass-panel border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white font-mono uppercase">Feature Importance Weights</h3>
              <span className="text-[11px] font-mono text-cyan-400">Sequence Extractor</span>
            </div>

            <div className="space-y-3">
              {featureWeights.map((feat, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-200 font-semibold">{feat.name}</span>
                    <span className="text-cyan-400 font-bold">{feat.importance}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                    <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${parseFloat(feat.importance) * 100}%` }}></div>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 font-sans">{feat.category}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-slate-800">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase">Model Card & Specifications</h3>
            </div>
            
            <div className="space-y-2 text-xs font-sans text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800/60 font-mono">
                <span className="text-slate-400">Framework</span>
                <span className="text-slate-200">scikit-learn / LightGBM + Wasm Edge Engine</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60 font-mono">
                <span className="text-slate-400">Mean Inference Latency</span>
                <span className="text-emerald-400 font-bold">0.12 ms</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60 font-mono">
                <span className="text-slate-400">Confidence Threshold</span>
                <span className="text-slate-200">0.60 Minimum for HELP execution</span>
              </div>
              <div className="flex justify-between py-1 font-mono">
                <span className="text-slate-400">Training Dataset</span>
                <span className="text-amber-400">Synthetic Realistic Sequence Benchmark (N=5,000)</span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Data Disclaimer:</strong> Synthetic datasets are used strictly to benchmark decision topologies and do not represent actual customer information.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
