"use client";

import { DecisionTrace } from "@/lib/types/models";
import { Sparkles, Check, X, ShieldAlert, BarChart3, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InterventionModalProps {
  trace: DecisionTrace | null;
  onAccept: () => void;
  onDismiss: () => void;
}

export function InterventionModal({ trace, onAccept, onDismiss }: InterventionModalProps) {
  if (!trace || trace.governorDecision !== "HELP" || !trace.actionPayload) {
    return null;
  }

  const payload = trace.actionPayload;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg rounded-2xl glass-panel border border-cyan-500/40 p-6 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                  Saarthi In-Session Assistance
                </span>
                <h3 className="text-base font-bold text-white tracking-tight">{payload.title}</h3>
              </div>
            </div>
            <button
              onClick={onDismiss}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
            {payload.description}
          </p>

          {/* Comparison Payload Details */}
          {payload.actionType === "COMPARE" && payload.entities && (
            <div className="mt-4 grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
              {payload.entities.map((entity, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <div className="font-semibold text-cyan-300 font-sans">{entity.name}</div>
                  <div className="mt-2 space-y-1 text-[11px] font-mono text-slate-400">
                    <div className="flex justify-between">
                      <span>Form:</span> <strong className="text-slate-200">{entity.details?.form || "W-W-D-W"}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>xG:</span> <strong className="text-slate-200">{entity.details?.xG || "2.1"}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Possession:</span> <strong className="text-slate-200">{entity.details?.possession || "60%"}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-5 flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
            <button
              onClick={onDismiss}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              No thanks, dismiss
            </button>
            <button
              onClick={onAccept}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept & Resolve Friction</span>
            </button>
          </div>

          <div className="mt-3 text-[10px] font-mono text-slate-400 text-center">
            Dismissing will calibrate policy fatigue to prevent repeated interruptions.
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
