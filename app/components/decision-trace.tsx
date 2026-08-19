"use client";

import { DecisionTrace } from "@/lib/types/models";
import { Activity, ShieldCheck, Clock, CheckCircle2, AlertTriangle, XCircle, ArrowUpRight, Cpu } from "lucide-react";

interface DecisionTraceProps {
  trace: DecisionTrace | null;
  isRunning?: boolean;
}

export function DecisionTracePanel({ trace, isRunning }: DecisionTraceProps) {
  if (!trace) {
    return (
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col items-center justify-center min-h-[380px] text-center">
        <Activity className="w-8 h-8 text-slate-400 mb-3 animate-pulse" />
        <h3 className="text-sm font-semibold text-slate-300">Live Decision Trace</h3>
        <p className="text-xs text-slate-400 max-w-xs mt-1">
          Perform actions in the simulator or run a scenario to inspect real-time inference & policy evaluation.
        </p>
      </div>
    );
  }

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case "HELP":
        return <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-mono">HELP</span>;
      case "WAIT":
        return <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold font-mono">WAIT</span>;
      case "DO_NOTHING":
      default:
        return <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold font-mono">DO NOTHING</span>;
    }
  };

  const getPolicyBadge = (status: string) => {
    switch (status) {
      case "ALLOWED":
        return <span className="text-emerald-400 font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> ALLOWED</span>;
      case "BLOCKED":
        return <span className="text-rose-400 font-semibold flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> BLOCKED</span>;
      case "SUPPRESSED":
      default:
        return <span className="text-amber-400 font-semibold flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> SUPPRESSED</span>;
    }
  };

  return (
    <div className="p-5 rounded-2xl glass-panel border border-slate-800 shadow-xl flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`}></div>
            <span className="text-xs font-mono text-slate-300 font-semibold uppercase tracking-wide">
              DECISION TRACE {trace.id.slice(0, 14)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
            <Clock className="w-3 h-3" />
            <span>{trace.metrics.totalDecisionLatencyMs}ms Total Latency</span>
          </div>
        </div>

        {/* Intent & Friction Scores */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Current Intent</div>
            <div className="text-cyan-400 font-bold text-base mt-0.5 tracking-tight">{trace.intent}</div>
            <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Confidence</span>
              <span className="text-slate-200">{Math.round(trace.intentConfidence * 100)}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
              <div className="bg-cyan-400 h-full rounded-full transition-all duration-300" style={{ width: `${trace.intentConfidence * 100}%` }}></div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Friction Detected</div>
            <div className="text-amber-400 font-bold text-base mt-0.5 tracking-tight truncate">{trace.friction}</div>
            <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Confidence</span>
              <span className="text-slate-200">{Math.round(trace.frictionConfidence * 100)}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
              <div className={`h-full rounded-full transition-all duration-300 ${trace.friction === 'NONE' ? 'bg-slate-500' : 'bg-amber-400'}`} style={{ width: `${trace.frictionConfidence * 100}%` }}></div>
            </div>
          </div>
        </div>

        {/* Governor Evaluation Box */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-700/80 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wide">Governor Output:</span>
            {getDecisionBadge(trace.governorDecision)}
          </div>
          
          <div className="text-xs text-slate-200 leading-relaxed font-sans bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
            <span className="text-slate-400 font-medium">Reason: </span>
            {trace.reason}
          </div>

          {trace.candidateAction && (
            <div className="mt-2.5 flex items-center justify-between text-xs font-mono text-slate-300 pt-2 border-t border-slate-800/60">
              <span className="text-slate-400">Action Type:</span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold">{trace.candidateAction}</span>
            </div>
          )}
        </div>

        {/* Policy Check Details */}
        <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs font-mono mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-400">Responsible AI Policy:</span>
            {getPolicyBadge(trace.policyStatus)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 leading-snug">
            {trace.policyReason}
          </div>
        </div>
      </div>

      {/* Latency Breakdown Bar */}
      <div className="pt-3 border-t border-slate-800/80">
        <div className="text-[10px] font-mono text-slate-400 uppercase mb-1.5 flex items-center justify-between">
          <span>Latency Breakdown</span>
          <span>Engine: Local JS/Wasm</span>
        </div>
        <div className="grid grid-cols-4 gap-1 text-[10px] font-mono text-slate-400 text-center">
          <div className="p-1 rounded bg-slate-900 border border-slate-800">
            <div>Events</div>
            <div className="text-slate-200 font-bold">{trace.metrics.eventProcessingLatencyMs}ms</div>
          </div>
          <div className="p-1 rounded bg-slate-900 border border-slate-800">
            <div>Features</div>
            <div className="text-slate-200 font-bold">{trace.metrics.featureCalculationLatencyMs}ms</div>
          </div>
          <div className="p-1 rounded bg-slate-900 border border-slate-800">
            <div>Models</div>
            <div className="text-slate-200 font-bold">{trace.metrics.modelInferenceLatencyMs}ms</div>
          </div>
          <div className="p-1 rounded bg-slate-900 border border-slate-800">
            <div>Governor</div>
            <div className="text-slate-200 font-bold">{trace.metrics.governorLatencyMs}ms</div>
          </div>
        </div>
      </div>
    </div>
  );
}
