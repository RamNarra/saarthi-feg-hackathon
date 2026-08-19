"use client";

import { SessionEvent } from "@/lib/types/events";
import { DecisionTrace } from "@/lib/types/models";
import { computeSessionValue } from "@/lib/engine/session-value";
import { computeSessionFeatures } from "@/lib/engine/feature-engine";
import { Clock, Eye, RotateCcw, BarChart2, Layers, Search, Sparkles, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";

interface SessionReplayProps {
  events: SessionEvent[];
  latestTrace: DecisionTrace | null;
}

export function SessionReplayTimeline({ events, latestTrace }: SessionReplayProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case "EVENT_VIEW":
        return <Eye className="w-3.5 h-3.5 text-cyan-400" />;
      case "BACK":
        return <RotateCcw className="w-3.5 h-3.5 text-amber-400" />;
      case "MARKET_VIEW":
      case "STATS_VIEW":
        return <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />;
      case "SEARCH":
        return <Search className="w-3.5 h-3.5 text-emerald-400" />;
      case "INTERVENTION_ACCEPTED":
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case "INTERVENTION_DISMISSED":
        return <AlertCircle className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  // Compute live Session Value score with strict semantic distinction:
  // Only GOAL_COMPLETED marks goal completion; INTERVENTION_ACCEPTED feeds satisfaction/helpfulness proxy.
  const sessionFeatures = computeSessionFeatures(events);
  const isGoalDone = events.some((e) => e.eventType === "GOAL_COMPLETED");
  const recordedOutcome = events.some((e) => e.eventType === "INTERVENTION_ACCEPTED")
    ? "ACCEPTED"
    : events.some((e) => e.eventType === "INTERVENTION_DISMISSED")
    ? "DISMISSED"
    : undefined;

  const sessionValue = computeSessionValue(
    sessionFeatures,
    latestTrace ? latestTrace.friction : "NONE",
    latestTrace ? latestTrace.governorDecision : "DO_NOTHING",
    recordedOutcome,
    isGoalDone,
    false
  );

  return (
    <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-semibold text-slate-200 uppercase">Session Telemetry Stream</h3>
          </div>
          <span className="text-[11px] font-mono text-cyan-400">
            {events.length} Events Logged
          </span>
        </div>

        {/* Live Value per Session Meter */}
        <div className="mb-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between text-xs font-mono mb-1">
            <span className="text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Value per Session (FEG C1 Metric):
            </span>
            <strong className="text-emerald-400 text-sm font-bold">{sessionValue.totalSessionValue.toFixed(2)} / 1.00</strong>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
            <div className="bg-emerald-400 h-full rounded-full transition-all duration-300" style={{ width: `${sessionValue.totalSessionValue * 100}%` }}></div>
          </div>
          <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-slate-400 text-center">
            <div className="p-1 rounded bg-slate-900 border border-slate-800/80">
              <span>Goal: </span><strong className="text-slate-200">+{sessionValue.goalCompletion.toFixed(2)}</strong>
            </div>
            <div className="p-1 rounded bg-slate-900 border border-slate-800/80">
              <span>Satisfaction: </span><strong className="text-slate-200">+{sessionValue.satisfactionProxy.toFixed(2)}</strong>
            </div>
            <div className="p-1 rounded bg-slate-900 border border-slate-800/80">
              <span>Friction: </span><strong className={sessionValue.unresolvedFrictionPenalty > 0 ? "text-rose-400" : "text-emerald-400"}>-{sessionValue.unresolvedFrictionPenalty.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs font-mono">
            No session events recorded yet. Click options in the viewport to simulate live telemetry.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {events.map((ev, idx) => (
              <div
                key={ev.id || idx}
                className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    {getEventIcon(ev.eventType)}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">{ev.eventType}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                      {ev.entityName || ev.entityId || "Navigation event"}
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400">
                  {new Date(ev.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
        <span>Channel: Saarthi Client SDK</span>
        <span>Transport: HTTPS / JSON</span>
      </div>
    </div>
  );
}
