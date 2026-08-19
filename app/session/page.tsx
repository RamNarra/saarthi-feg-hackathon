"use client";

import { useState } from "react";
import { SessionEvent } from "@/lib/types/events";
import { DecisionTrace } from "@/lib/types/models";
import { createSaarthiClient, SaarthiDecisionResponse } from "@/lib/sdk/saarthi-client";
import { DecisionTracePanel } from "../components/decision-trace";
import { SessionReplayTimeline } from "../components/session-replay";
import { InterventionModal } from "../components/intervention-modal";
import { Play, RotateCcw, ShieldAlert, Sparkles, CheckCircle2, ChevronRight, Search, ArrowLeft, BarChart2, Check, X, Layers, AlertCircle } from "lucide-react";

export default function SessionSimulatorPage() {
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [currentTrace, setCurrentTrace] = useState<DecisionTrace | null>(null);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showIntervention, setShowIntervention] = useState<boolean>(false);
  const [userDismissalCount, setUserDismissalCount] = useState<number>(0);
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>(() => `sess_sim_${Date.now()}`);

  const [saarthiClient] = useState(() =>
    createSaarthiClient({
      sessionId,
      userId: "usr_host_client_01",
    })
  );

  const mapApiResponseToTrace = (data: SaarthiDecisionResponse, eventList: SessionEvent[]): DecisionTrace => {
    return {
      id: `trace_${Date.now()}`,
      sessionId: data.sessionId,
      timestamp: data.telemetry.measuredAt,
      intent: data.intent.label as any,
      intentConfidence: data.intent.confidence,
      friction: data.friction.label as any,
      frictionConfidence: data.friction.confidence,
      governorDecision: data.decision.action,
      candidateAction: data.decision.candidateAction,
      rankedCandidates: (data.decision as any).rankedCandidates || [],
      selectedUtility: (data.decision as any).selectedUtility || data.decision.expectedHelpValue || 0,
      intrusionCost: (data.decision as any).intrusionCost || 0.25,
      netUtilityScore: (data.decision as any).netUtilityScore || 0,
      expectedSessionValue: (data.decision as any).expectedSessionValue || 0,
      policyStatus: data.policy.status,
      policyReason: data.policy.reason,
      trustGate: {
        eligible: data.policy.status === "ALLOWED",
        status: data.policy.status,
        gateName: "RESPONSIBLE_PLAY",
        reason: data.policy.reason,
      },
      reason: data.friction.signals?.[0] || "Evaluation completed via Saarthi API",
      expectedHelpValue: data.decision.expectedHelpValue,
      structuredState: (data as any).structuredState || {
        journeyStage: "DISCOVERY",
        activeEntities: [],
        comparisonSet: [],
        inferredGoal: "In-session exploration",
        finalStepContext: { stepName: "NONE", timeInConfirmationSec: 0, unacknowledgedChange: false, hesitationSignals: [] },
        frictionHistory: [],
        interventionHistory: [],
      },
      actionPayload: data.decision.payload,
      metrics: {
        eventProcessingLatencyMs: 0.05,
        featureCalculationLatencyMs: 0.15,
        modelInferenceLatencyMs: 0.1,
        governorLatencyMs: 0.1,
        totalDecisionLatencyMs: data.telemetry.engineLatencyMs,
      },
      outcome: data.decision.action === "HELP" ? "INTERVENTION_OFFERED" : "NO_INTERVENTION",
    };
  };

  const triggerEvent = async (
    eventType: SessionEvent["eventType"],
    entityId?: string,
    entityName?: string,
    metadata?: Record<string, unknown>
  ) => {
    const newEvent: SessionEvent = {
      id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sessionId,
      userId: "usr_host_client_01",
      timestamp: new Date().toISOString(),
      eventType,
      entityId,
      entityName,
      metadata: metadata || {},
    };

    const nextEvents = [...events, newEvent];
    setEvents(nextEvents);

    try {
      // Dogfood Saarthi SDK -> POST /api/v1/session/events
      const data = await saarthiClient.trackEvent(eventType, entityId, entityName, metadata);
      const trace = mapApiResponseToTrace(data, nextEvents);
      setCurrentTrace(trace);

      if (data.decision.action === "HELP" && data.policy.status === "ALLOWED") {
        setShowIntervention(true);
      }
    } catch (err) {
      console.error("Saarthi SDK call failed:", err);
    }
  };

  const resetSession = () => {
    const nextId = `sess_sim_${Date.now()}`;
    setSessionId(nextId);
    setEvents([]);
    setCurrentTrace(null);
    setActiveScenario(null);
    setIsPlaying(false);
    setShowIntervention(false);
    setUserDismissalCount(0);
    setSessionCompleted(false);
  };

  // Scenario Scripts using Saarthi Client SDK
  const runScriptedScenario = async (scenario: "A" | "B" | "C" | "D" | "E") => {
    resetSession();
    setIsPlaying(true);
    setActiveScenario(scenario);

    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
    const activeSessionId = `sess_sc_${scenario}_${Date.now()}`;
    const client = createSaarthiClient({
      sessionId: activeSessionId,
      userId: "usr_script_demo",
    });

    if (scenario === "A") {
      // Scenario A: Normal Browsing -> DO NOTHING
      const scriptEvents: Array<{ type: SessionEvent["eventType"]; id?: string; name?: string; meta?: any }> = [
        { type: "SESSION_START" },
        { type: "EVENT_VIEW", id: "arsenal", name: "Arsenal vs Chelsea" },
        { type: "STATS_VIEW", id: "arsenal", name: "Match Statistics" },
        { type: "BACK" },
        { type: "EVENT_VIEW", id: "man_city", name: "Man City vs Spurs" },
        { type: "STATS_VIEW", id: "man_city", name: "Spurs Form Guide" },
      ];

      let accEvents: SessionEvent[] = [];
      for (const step of scriptEvents) {
        await delay(450);
        const ev: SessionEvent = {
          id: `ev_scA_${Date.now()}`,
          sessionId: activeSessionId,
          userId: "usr_script_demo",
          timestamp: new Date().toISOString(),
          eventType: step.type,
          entityId: step.id,
          entityName: step.name,
          metadata: step.meta || {},
        };
        accEvents = [...accEvents, ev];
        setEvents([...accEvents]);
        const data = await client.trackEvent(step.type, step.id, step.name, step.meta);
        setCurrentTrace(mapApiResponseToTrace(data, accEvents));
      }
    } else if (scenario === "B") {
      // Scenario B: Friction Resolution (Compare loop) -> HELP
      const scriptEvents: Array<{ type: SessionEvent["eventType"]; id?: string; name?: string; meta?: any }> = [
        { type: "SESSION_START" },
        { type: "EVENT_VIEW", id: "arsenal", name: "Arsenal" },
        { type: "STATS_VIEW", id: "arsenal", name: "Arsenal xG & Squad" },
        { type: "BACK" },
        { type: "EVENT_VIEW", id: "liverpool", name: "Liverpool" },
        { type: "STATS_VIEW", id: "liverpool", name: "Liverpool xG & Form" },
        { type: "BACK" },
        { type: "EVENT_VIEW", id: "arsenal", name: "Arsenal" },
        { type: "MARKET_VIEW", id: "arsenal", name: "Arsenal Markets" },
        { type: "BACK" },
        { type: "EVENT_VIEW", id: "liverpool", name: "Liverpool" },
      ];

      let accEvents: SessionEvent[] = [];
      for (const step of scriptEvents) {
        await delay(400);
        const ev: SessionEvent = {
          id: `ev_scB_${Date.now()}`,
          sessionId: activeSessionId,
          userId: "usr_script_demo",
          timestamp: new Date().toISOString(),
          eventType: step.type,
          entityId: step.id,
          entityName: step.name,
          metadata: step.meta || {},
        };
        accEvents = [...accEvents, ev];
        setEvents([...accEvents]);
        const data = await client.trackEvent(step.type, step.id, step.name, step.meta);
        const trace = mapApiResponseToTrace(data, accEvents);
        setCurrentTrace(trace);
        if (data.decision.action === "HELP") {
          setShowIntervention(true);
        }
      }
    } else if (scenario === "C") {
      // Scenario C: User Rejects Help -> Policy Fatigue Suppression
      const scriptEvents: Array<{ type: SessionEvent["eventType"]; id?: string; name?: string }> = [
        { type: "SESSION_START" },
        { type: "EVENT_VIEW", id: "arsenal", name: "Arsenal" },
      ];

      let accEvents: SessionEvent[] = [];
      for (const step of scriptEvents) {
        await delay(400);
        const ev: SessionEvent = {
          id: `ev_scC_${Date.now()}`,
          sessionId: activeSessionId,
          userId: "usr_script_demo",
          timestamp: new Date().toISOString(),
          eventType: step.type,
          entityId: step.id,
          entityName: step.name,
        };
        accEvents = [...accEvents, ev];
        setEvents([...accEvents]);
        const data = await client.trackEvent(step.type, step.id, step.name);
        setCurrentTrace(mapApiResponseToTrace(data, accEvents));
      }

      await client.recordOutcome("DISMISSED", "Intervention dismissed by user");

      const subsequentEvents: Array<{ type: SessionEvent["eventType"]; id?: string; name?: string }> = [
        { type: "EVENT_VIEW", id: "liverpool", name: "Liverpool" },
        { type: "BACK" },
        { type: "EVENT_VIEW", id: "arsenal", name: "Arsenal" },
        { type: "BACK" },
        { type: "EVENT_VIEW", id: "liverpool", name: "Liverpool" },
      ];

      for (const step of subsequentEvents) {
        await delay(400);
        const ev: SessionEvent = {
          id: `ev_scC_${Date.now()}`,
          sessionId: activeSessionId,
          userId: "usr_script_demo",
          timestamp: new Date().toISOString(),
          eventType: step.type,
          entityId: step.id,
          entityName: step.name,
        };
        accEvents = [...accEvents, ev];
        setEvents([...accEvents]);
        const data = await client.trackEvent(step.type, step.id, step.name);
        setCurrentTrace(mapApiResponseToTrace(data, accEvents));
      }
    } else if (scenario === "D") {
      // Scenario D: Trust & Safety Suppression
      await client.recordOutcome("DISMISSED");

      const scriptEvents: Array<{ type: SessionEvent["eventType"]; id?: string; name?: string }> = [
        { type: "SESSION_START" },
        { type: "EVENT_VIEW", id: "arsenal", name: "Arsenal" },
        { type: "BACK" },
        { type: "EVENT_VIEW", id: "liverpool", name: "Liverpool" },
        { type: "BACK" },
        { type: "EVENT_VIEW", id: "arsenal", name: "Arsenal" },
        { type: "BACK" },
        { type: "EVENT_VIEW", id: "liverpool", name: "Liverpool" },
      ];

      let accEvents: SessionEvent[] = [];
      for (const step of scriptEvents) {
        await delay(400);
        const ev: SessionEvent = {
          id: `ev_scD_${Date.now()}`,
          sessionId: activeSessionId,
          userId: "usr_script_demo",
          timestamp: new Date().toISOString(),
          eventType: step.type,
          entityId: step.id,
          entityName: step.name,
        };
        accEvents = [...accEvents, ev];
        setEvents([...accEvents]);
        const data = await client.trackEvent(step.type, step.id, step.name);
        setCurrentTrace(mapApiResponseToTrace(data, accEvents));
      }
    } else if (scenario === "E") {
      // Scenario E: Final-Step Drop-Off Resolution (Confirmation Step Clarity)
      const scriptEvents: Array<{ type: SessionEvent["eventType"]; id?: string; name?: string; meta?: any }> = [
        { type: "SESSION_START" },
        { type: "EVENT_VIEW", id: "arsenal", name: "Arsenal vs Chelsea" },
        { type: "MARKET_VIEW", id: "market_confirm_slip", name: "Review Confirmation Slip", meta: { isSlipReview: true, oddsChanged: true } },
        { type: "BACK" },
        { type: "MARKET_VIEW", id: "market_confirm_slip", name: "Review Confirmation Slip", meta: { isSlipReview: true, oddsChanged: true } },
      ];

      let accEvents: SessionEvent[] = [];
      for (const step of scriptEvents) {
        await delay(450);
        const ev: SessionEvent = {
          id: `ev_scE_${Date.now()}`,
          sessionId: activeSessionId,
          userId: "usr_script_demo",
          timestamp: new Date().toISOString(),
          eventType: step.type,
          entityId: step.id,
          entityName: step.name,
          metadata: step.meta || {},
        };
        accEvents = [...accEvents, ev];
        setEvents([...accEvents]);
        const data = await client.trackEvent(step.type, step.id, step.name, step.meta);
        const trace = mapApiResponseToTrace(data, accEvents);
        setCurrentTrace(trace);
        if (data.decision.action === "HELP") {
          setShowIntervention(true);
        }
      }
    }

    setIsPlaying(false);
  };

  const handleInterventionAccept = async () => {
    setShowIntervention(false);
    await saarthiClient.recordOutcome("ACCEPTED", "User accepted clarification");
    await triggerEvent("INTERVENTION_ACCEPTED", "clarify_widget", "Action Clarification Accepted");
    setSessionCompleted(true);
  };

  const handleInterventionDismiss = async () => {
    setShowIntervention(false);
    setUserDismissalCount((prev) => prev + 1);
    await saarthiClient.recordOutcome("DISMISSED", "Intervention dismissed by user");
    await triggerEvent("INTERVENTION_DISMISSED", "clarify_widget", "Intervention Dismissed by User");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Live Session Simulator</h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Saarthi v2 Platform
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Simulate live user events streaming through the Saarthi Client SDK into the backend Decision API across all 7 journey stages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={resetSession}
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5 border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Session</span>
          </button>
        </div>
      </div>

      {/* Scripted Scenarios Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 mb-8">
        <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
          <span>Preset Demo Scenarios</span>
          <span className="text-[11px] text-cyan-400">Click to stream events via Saarthi SDK</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <button
            onClick={() => runScriptedScenario("A")}
            disabled={isPlaying}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeScenario === "A"
                ? "bg-slate-800 border-cyan-500 text-white"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold font-mono text-cyan-400">Scenario A</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">DO NOTHING</span>
            </div>
            <div className="text-xs font-semibold text-white">Normal Browsing</div>
            <div className="text-[11px] text-slate-400 mt-1">Fluent navigation without friction. Restraint applied.</div>
          </button>

          <button
            onClick={() => runScriptedScenario("B")}
            disabled={isPlaying}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeScenario === "B"
                ? "bg-slate-800 border-emerald-500 text-white"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold font-mono text-emerald-400">Scenario B</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono font-bold">HELP</span>
            </div>
            <div className="text-xs font-semibold text-white">Friction Resolution</div>
            <div className="text-[11px] text-slate-400 mt-1">Alternation (A⇄B) ranks COMPARE as #1 utility action.</div>
          </button>

          <button
            onClick={() => runScriptedScenario("E")}
            disabled={isPlaying}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeScenario === "E"
                ? "bg-slate-800 border-indigo-500 text-white"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold font-mono text-indigo-400">Scenario E</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono font-bold">HELP</span>
            </div>
            <div className="text-xs font-semibold text-white">Final-Step Drop-Off</div>
            <div className="text-[11px] text-slate-400 mt-1">Confirmation hesitation triggers transparent terms summary.</div>
          </button>

          <button
            onClick={() => runScriptedScenario("C")}
            disabled={isPlaying}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeScenario === "C"
                ? "bg-slate-800 border-amber-500 text-white"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold font-mono text-amber-400">Scenario C</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 font-mono">SUPPRESSED</span>
            </div>
            <div className="text-xs font-semibold text-white">User Dismissal Fatigue</div>
            <div className="text-[11px] text-slate-400 mt-1">Outcome API registers dismissal and activates cooldown.</div>
          </button>

          <button
            onClick={() => runScriptedScenario("D")}
            disabled={isPlaying}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeScenario === "D"
                ? "bg-slate-800 border-rose-500 text-white"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold font-mono text-rose-400">Scenario D</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 font-mono font-bold">SUPPRESSED</span>
            </div>
            <div className="text-xs font-semibold text-white">Trust / Fatigue Gate</div>
            <div className="text-[11px] text-slate-400 mt-1">Fatigue cooldown actively suppresses candidate interruption.</div>
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive App Simulator + Replay + Decision Trace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive App Mockup (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-2xl glass-panel border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                <h3 className="text-xs font-mono font-semibold text-slate-200 uppercase">Sports App Viewport</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Premier League</span>
            </div>

            {/* Simulated Entities */}
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-sm">Arsenal FC</span>
                  <span className="text-xs font-mono text-emerald-400">1st • 58 pts</span>
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    onClick={() => triggerEvent("EVENT_VIEW", "arsenal", "Arsenal FC")}
                    className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[11px] font-medium hover:bg-cyan-900 transition-colors"
                  >
                    View Match
                  </button>
                  <button
                    onClick={() => triggerEvent("STATS_VIEW", "arsenal", "Arsenal xG & Squad")}
                    className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-[11px] hover:bg-slate-700 transition-colors"
                  >
                    Stats
                  </button>
                  <button
                    onClick={() => triggerEvent("MARKET_VIEW", "market_slip_arsenal", "Review Confirmation Slip", { isSlipReview: true, oddsChanged: true })}
                    className="px-2.5 py-1 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30 text-[11px] hover:bg-indigo-900 transition-colors"
                  >
                    Review Slip
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-sm">Liverpool FC</span>
                  <span className="text-xs font-mono text-cyan-400">2nd • 56 pts</span>
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    onClick={() => triggerEvent("EVENT_VIEW", "liverpool", "Liverpool FC")}
                    className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[11px] font-medium hover:bg-cyan-900 transition-colors"
                  >
                    View Match
                  </button>
                  <button
                    onClick={() => triggerEvent("STATS_VIEW", "liverpool", "Liverpool xG & Squad")}
                    className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-[11px] hover:bg-slate-700 transition-colors"
                  >
                    Stats
                  </button>
                  <button
                    onClick={() => triggerEvent("MARKET_VIEW", "market_slip_liverpool", "Review Confirmation Slip", { isSlipReview: true })}
                    className="px-2.5 py-1 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30 text-[11px] hover:bg-indigo-900 transition-colors"
                  >
                    Review Slip
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <button
                onClick={() => triggerEvent("BACK")}
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                onClick={() => triggerEvent("SEARCH", "search_q", "Reformulated Search Query")}
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-1"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
              <button
                onClick={() => {
                  triggerEvent("GOAL_COMPLETED", "goal_done", "Session Goal Finished");
                  setSessionCompleted(true);
                }}
                className="flex-1 px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900 text-xs font-medium transition-colors flex items-center justify-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm</span>
              </button>
            </div>
          </div>

          {sessionCompleted && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><strong>High-Value Session Completed:</strong> User achieved legitimate goal with zero pressure.</span>
            </div>
          )}
        </div>

        {/* Center Column: Session Replay Timeline (4 cols) */}
        <div className="lg:col-span-4">
          <SessionReplayTimeline events={events} latestTrace={currentTrace} />
        </div>

        {/* Right Column: Live Decision Trace with Utility Ranking (4 cols) */}
        <div className="lg:col-span-4">
          <DecisionTracePanel trace={currentTrace} isRunning={isPlaying} />
        </div>
      </div>

      {/* Pop-up Intervention Modal */}
      {showIntervention && (
        <InterventionModal
          trace={currentTrace}
          onAccept={handleInterventionAccept}
          onDismiss={handleInterventionDismiss}
        />
      )}
    </div>
  );
}
