"use client";

import { SessionEvent } from "@/lib/types/events";
import { DecisionTrace } from "@/lib/types/models";
import { Clock, CheckCircle, AlertCircle, ArrowRight, Eye, RefreshCw, Zap } from "lucide-react";

interface SessionReplayProps {
  events: SessionEvent[];
  latestTrace: DecisionTrace | null;
  onSelectEventIndex?: (index: number) => void;
  selectedIndex?: number;
}

export function SessionReplayTimeline({
  events,
  latestTrace,
  onSelectEventIndex,
  selectedIndex,
}: SessionReplayProps) {
  if (events.length === 0) {
    return (
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col items-center justify-center min-h-[380px] text-center">
        <Clock className="w-8 h-8 text-slate-400 mb-3" />
        <h3 className="text-sm font-semibold text-slate-300">Session Replay Timeline</h3>
        <p className="text-xs text-slate-400 max-w-xs mt-1">
          As events occur in the session, reconstructed chronological milestones will appear here.
        </p>
      </div>
    );
  }

  const getEventBadge = (type: string) => {
    switch (type) {
      case "EVENT_VIEW":
        return <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[10px] font-mono">EVENT_VIEW</span>;
      case "STATS_VIEW":
        return <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px] font-mono">STATS_VIEW</span>;
      case "MARKET_VIEW":
        return <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-mono">MARKET_VIEW</span>;
      case "BACK":
        return <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-mono">BACKTRACK</span>;
      case "INTERVENTION_SHOWN":
        return <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">HELP OFFERED</span>;
      case "INTERVENTION_ACCEPTED":
        return <span className="px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 text-[10px] font-mono font-bold">ACCEPTED</span>;
      case "INTERVENTION_DISMISSED":
        return <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold">DISMISSED</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-mono">{type}</span>;
    }
  };

  return (
    <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-semibold text-slate-200 uppercase tracking-wide">
            Reconstructed Timeline ({events.length} events)
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">Interactive Replay</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 max-h-[320px] pr-1 custom-scrollbar">
        {events.map((ev, idx) => {
          const isCurrent = selectedIndex === idx || (selectedIndex === undefined && idx === events.length - 1);
          const timeFormatted = ev.timestamp.slice(11, 19);

          return (
            <div
              key={idx}
              onClick={() => onSelectEventIndex && onSelectEventIndex(idx)}
              className={`p-2.5 rounded-xl border text-xs font-mono transition-all cursor-pointer flex items-center justify-between ${
                isCurrent
                  ? "bg-cyan-950/40 border-cyan-500/50 shadow-sm"
                  : "bg-slate-950/40 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-[10px]">{timeFormatted}</span>
                {getEventBadge(ev.eventType)}
                <span className="text-slate-300 font-sans text-xs truncate max-w-[160px]">
                  {ev.entityName || ev.entityId || "Session action"}
                </span>
              </div>

              <div className="text-[10px] text-slate-400">
                #{idx + 1}
              </div>
            </div>
          );
        })}
      </div>

      {/* Decision Summary Milestone Banner */}
      {latestTrace && latestTrace.governorDecision === "HELP" && (
        <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
          <span><strong>Intervention Triggered:</strong> {latestTrace.candidateAction} presented to user.</span>
        </div>
      )}

      {latestTrace && latestTrace.governorDecision === "DO_NOTHING" && (
        <div className="mt-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-slate-400 shrink-0" />
          <span><strong>Governor Restraint:</strong> Deliberately remaining silent (no unsolicited interruption).</span>
        </div>
      )}
    </div>
  );
}
