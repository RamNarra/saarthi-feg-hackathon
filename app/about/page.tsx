"use client";

import { ShieldCheck, EyeOff, AlertTriangle, CheckCircle2, Lock, HeartHandshake, Sparkles } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Responsible AI &amp; Ethical Guardrails</h1>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Player Protection
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-400">
          Core principles, non-negotiable player protection constraints, and transparent system limitations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Ethical Principles (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl glass-panel border border-slate-800">
            <div className="flex items-center gap-2.5 mb-4">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white uppercase font-mono">The Non-Negotiable Standard</h2>
            </div>
            
            <blockquote className="p-4 rounded-xl bg-slate-950/80 border-l-4 border-cyan-400 text-sm text-slate-200 italic mb-4">
              "Improvement must come from relevance and reduced friction, never pressure. No dark patterns."
            </blockquote>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Saarthi is architected from the ground up as a <strong>guide</strong>, not a controller. It actively restricts manipulative conversion patterns:
            </p>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>No Pressure or Urgency Tactics:</strong> Never generates fake countdowns, urgency cues, or aggressive promotional prompts.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>User Agency &amp; Dismissal Honor:</strong> If a user dismisses an intervention, the adaptive fatigue guard suppresses interruptions for the remainder of the active exploration.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Explicit 'Do Nothing' State:</strong> Silence is treated as a first-class success state. Saarthi intervenes only when expected assistance value is high.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Auditable Decision Trail:</strong> Every single governor decision produces an immutable log of input signals, confidence scores, policy rules, and latency.</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-slate-800">
            <div className="flex items-center gap-2.5 mb-3">
              <HeartHandshake className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase font-mono">Meaningful Session Success</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Saarthi defines session value by user-centric outcomes (successful research, side-by-side comparison completed, content saved, smooth discovery) rather than commercial transactions alone.
            </p>
          </div>
        </div>

        {/* Right Column: Limitations & Disclaimers (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl glass-panel border border-slate-800">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase">System Limitations &amp; Integrity</h3>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="font-semibold text-amber-300 font-mono">Synthetic Benchmark Data</div>
                <div className="text-[11px] text-slate-400 mt-1 font-sans">
                  All dataset metrics (N=5,000 sessions) represent synthetic behavioral topologies to evaluate engine accuracy. No real customer data was used or accessed.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="font-semibold text-amber-300 font-mono">Prototype Scope</div>
                <div className="text-[11px] text-slate-400 mt-1 font-sans">
                  The current deployment operates as a high-fidelity standalone demo and testbed. Integration with production streaming pipelines (Kafka/Redis) is documented as architecture evolution.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="font-semibold text-amber-300 font-mono">No Unsupported Psychological Claims</div>
                <div className="text-[11px] text-slate-400 mt-1 font-sans">
                  Friction detection is grounded strictly in observable sequence features (backtracks, alternation, dwell time) paired with explicit confidence scores.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
