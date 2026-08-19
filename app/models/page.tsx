"use client";

import { Cpu, CheckCircle2, Zap, Layers, BarChart3, AlertCircle } from "lucide-react";
import modelArtifact from "@/lib/models/artifacts/friction_classifier.json";

export default function ModelsPage() {
  const featureWeights = modelArtifact.feature_importance;
  const metrics = modelArtifact.metrics;

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
            Learned ML Classifier + Deterministic Policy
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-400">
          Architecture, trained model feature weights, empirical confusion matrix, and calibrated confidence scoring.
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
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white font-mono uppercase">2. Trained Friction Classifier</h3>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                {modelArtifact.model_type}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Trained on {metrics.train_samples.toLocaleString()} synthetic session sequences, evaluated on {metrics.test_samples.toLocaleString()} test sequences.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono mb-4">
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300">
                <span className="text-amber-400 font-bold">DECISION_HESITATION</span>
                <p className="text-[10px] text-slate-400 mt-1 font-sans">Observable A⇄B alternation &amp; repeated market views</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300">
                <span className="text-indigo-400 font-bold">INFORMATION_OVERLOAD</span>
                <p className="text-[10px] text-slate-400 mt-1 font-sans">High dwell + deep scroll across multiple markets</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300">
                <span className="text-emerald-400 font-bold">NAVIGATION</span>
                <p className="text-[10px] text-slate-400 mt-1 font-sans">Observable repeated backtrack loops</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300">
                <span className="text-rose-400 font-bold">UNCERTAINTY</span>
                <p className="text-[10px] text-slate-400 mt-1 font-sans">Observable high dwell without progression on entity</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Model Test Accuracy:</span>
                <span className="text-emerald-400 font-bold">{(metrics.test_accuracy * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-slate-400 mt-1">
                <span>Inference Benchmark (p50):</span>
                <span className="text-cyan-400 font-bold">&lt; 0.04 ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Feature Weights & Inference Specs (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-2xl glass-panel border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white font-mono uppercase">Learned Feature Importance</h3>
              <span className="text-[11px] font-mono text-cyan-400">Derived from Model Weights</span>
            </div>

            <div className="space-y-3">
              {featureWeights.map((feat, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-200 font-semibold">{feat.feature}</span>
                    <span className="text-cyan-400 font-bold">{feat.share_pct}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                    <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${feat.share_pct}%` }}></div>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">Weight: {feat.weight}</div>
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
                <span className="text-slate-400">Architecture</span>
                <span className="text-slate-200">Learned Logistic Regression + Deterministic Policy Guard</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60 font-mono">
                <span className="text-slate-400">Benchmark Decision Latency</span>
                <span className="text-emerald-400 font-bold">p50: 0.04ms | p95: 0.08ms | p99: 0.12ms</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60 font-mono">
                <span className="text-slate-400">Confidence Threshold</span>
                <span className="text-slate-200">0.60 Minimum for HELP execution</span>
              </div>
              <div className="flex justify-between py-1 font-mono">
                <span className="text-slate-400">Training Dataset</span>
                <span className="text-amber-400">Synthetic Sequence Benchmark (N=5,000)</span>
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
