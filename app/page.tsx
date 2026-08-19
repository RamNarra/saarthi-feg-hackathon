import Link from "next/link";
import { ArrowRight, Activity, ShieldCheck, Zap, Layers, BarChart2, EyeOff, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative isolate overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-cyan-500/20 to-blue-600/30 opacity-40 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FEG Innovation Hackathon 2026 — Challenge 1</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight sm:leading-none">
            Users don't always abandon because they aren't interested.
            <span className="block mt-3 bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
              Sometimes they're stuck.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            <strong className="text-white font-semibold">Saarthi</strong> understands in-session intent, detects where the journey gets stuck, and determines whether assistance would genuinely reduce friction — <span className="text-cyan-300 underline decoration-cyan-500/40 underline-offset-4">or deliberately does nothing.</span>
          </p>

          {/* Core Decision Architecture Flow */}
          <div className="mt-10 p-5 rounded-2xl glass-panel glow-subtle border border-slate-700/60 max-w-3xl mx-auto">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-3 text-left flex items-center justify-between">
              <span>Real-Time Decisioning Pipeline</span>
              <span className="text-emerald-400 font-medium">Sub-millisecond inference</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm font-mono text-slate-200">
              <span className="px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700">USER SESSION</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <span className="px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700">SESSION INTENT</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <span className="px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700">FRICTION DETECTOR</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <span className="px-3 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-semibold">GOVERNOR</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-1 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs">HELP</span>
                <span className="px-2 py-1 rounded bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs">WAIT</span>
                <span className="px-2 py-1 rounded bg-slate-800/80 border border-slate-600 text-slate-300 text-xs font-semibold">DO NOTHING</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/session"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm sm:text-base transition-all shadow-lg hover:shadow-cyan-500/25 flex items-center gap-2"
            >
              <span>Run Live Demo Simulator</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/architecture"
              className="px-6 py-3.5 rounded-xl glass-card hover:bg-slate-800/80 text-slate-200 hover:text-white font-medium text-sm sm:text-base transition-all border border-slate-700 flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Explore Architecture</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Four Product Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/60">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400">Core Foundations</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white">The Four Pillars of Saarthi</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1 */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">1. Session Intelligence</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Evaluates active in-session behavioral sequences to classify instant intent: <code className="text-xs text-cyan-300">DISCOVER</code>, <code className="text-xs text-cyan-300">RESEARCH</code>, <code className="text-xs text-cyan-300">COMPARE</code>, <code className="text-xs text-cyan-300">FOLLOW</code>, <code className="text-xs text-cyan-300">READY_TO_ACT</code>.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-400">
              Not merely long-term static profile
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">2. Friction Detection</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Detects observable sequence patterns: alternation loops (A→B→A→B), rapid backtracking, search reformulations, and information overload with calibrated confidence.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-400">
              Observable behavioral sequences
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <EyeOff className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">3. Real-Time Governor</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Deterministic policy layer that weighs confidence, fatigue limits, and player protection. Outputs <strong className="text-emerald-300 font-semibold">HELP</strong>, <strong className="text-amber-300 font-semibold">WAIT</strong>, or <strong className="text-slate-300 font-semibold">DO NOTHING</strong>.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-400">
              "Do nothing" is a deliberate success state
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">4. High-Value Outcomes</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Measures success via <strong>High-Value Session Completion</strong> (meaningful discovery, comparison completed, goal achieved) — never by pushy promotional conversion.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-400">
              Zero dark patterns or pressure
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Feature Matrix */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="p-8 rounded-3xl glass-panel border border-slate-800 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono mb-4">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Non-Negotiable Responsible AI</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Designed for Guiding, Not Pushing
              </h2>
              <p className="mt-4 text-slate-300 text-sm leading-relaxed">
                Traditional conversion systems maximize clicks or trigger aggressive promotions. Saarthi adheres to responsible play principles:
              </p>
              <ul className="mt-6 space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-1 shrink-0" />
                  <span><strong>Smallest Useful Intervention:</strong> Surfaces minimal contextual actions (side-by-side comparison, narrow filters, resume).</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-1 shrink-0" />
                  <span><strong>Adaptive Fatigue Guard:</strong> Rejection immediately cools down interventions for the session.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-1 shrink-0" />
                  <span><strong>Explainable Audit Trail:</strong> Every single decision records confidence, exact policy status, and reasoning.</span>
                </li>
              </ul>

              <div className="mt-8 flex items-center gap-4">
                <Link
                  href="/session"
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition-all"
                >
                  Test 4 Demo Scenarios
                </Link>
                <Link
                  href="/about"
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-all"
                >
                  Read Responsible AI Specs
                </Link>
              </div>
            </div>

            {/* Simulated Mini Decision Card */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="font-mono text-xs text-slate-300">LIVE DECISION TRACE #A1842</span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                  LATENCY: 0.95ms
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono mb-4">
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">CURRENT INTENT</div>
                  <div className="text-cyan-400 font-bold text-sm mt-1">COMPARE</div>
                  <div className="text-slate-400 text-[10px]">91% confidence</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">FRICTION DETECTED</div>
                  <div className="text-amber-400 font-bold text-sm mt-1">DECISION_HESITATION</div>
                  <div className="text-slate-400 text-[10px]">87% confidence</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-cyan-500/30 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">GOVERNOR DECISION:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold text-xs">HELP</span>
                </div>
                <div className="mt-2 text-xs text-slate-300 leading-snug">
                  "Looks like you're comparing two options. Compare them side by side?"
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
                <span>POLICY: <strong className="text-emerald-400">ALLOWED</strong></span>
                <span>OUTCOME: <strong className="text-cyan-300">FRICTION RESOLVED</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
