"use client";

import { Layers, Server, Cloud, Cpu, ArrowRight, ShieldCheck, Database, Code2, Globe } from "lucide-react";

export default function ArchitecturePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">System Architecture &amp; Integration Platform</h1>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Intelligence Layer Platform
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-400">
          Saarthi operates as an autonomous, low-latency session-intelligence service that sits on top of any digital entertainment product via REST/Event SDK.
        </p>
      </div>

      <div className="space-y-12">
        {/* 0. Enterprise Integration Model */}
        <div className="p-6 rounded-2xl glass-panel border border-cyan-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/20">
          <div className="flex items-center gap-2.5 mb-4">
            <Globe className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white font-mono uppercase">Platform Integration Topology</h2>
          </div>
          <p className="text-xs text-slate-300 mb-6 leading-relaxed">
            Existing products (sportsbook, casino, gaming) do not need to rebuild their user experiences. They simply stream client telemetry to Saarthi and receive minimal non-coercive intervention directives.
          </p>

          <div className="font-mono text-xs text-slate-300 overflow-x-auto p-4 rounded-xl bg-slate-950 border border-slate-800">
            <pre>{`┌───────────────────────────────┐        ┌───────────────────────────────┐
│   FEG Web / Mobile Host App   │        │     Other Brand / Service     │
│   (Sportsbook / Casino / UI)  │        │   (Games / Entertainment App) │
└───────────────┬───────────────┘        └───────────────┬───────────────┘
                │                                        │
                │  POST /api/v1/session/events           │
                └───────────────────┬────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        SAARTHI INTELLIGENCE CORE                       │
│                                                                        │
│  1. Event Ingestion & Window Buffer                                    │
│  2. Sequence Feature Engine (alternation, backtracks, dwell time)      │
│  3. Learned Friction Classifier (Trained Multinomial Logit, p50<0.04ms)│
│  4. Responsible-Play Policy Guard (Fatigue suppression, cooldowns)     │
│  5. Intervention Governor (HELP / WAIT / DO_NOTHING)                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    │  Response: Action Payload / Restraint
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Host UX Surface: Minimal contextual help (Compare / Filter / Silence) │
└────────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </div>

        {/* 1. Implemented REST Decision API */}
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs">
              01
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Implemented REST Decision API</h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-bold">
                  LIVE &amp; TESTED
                </span>
              </div>
              <p className="text-xs text-slate-400">Available across all platforms with sub-millisecond edge decisioning</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl glass-panel border border-slate-800">
              <div className="text-emerald-400 font-bold mb-2 flex items-center gap-1.5">
                <Code2 className="w-4 h-4" />
                <span>POST /api/v1/session/events</span>
              </div>
              <p className="text-slate-400 text-[11px] font-sans mb-3">
                Accepts event telemetry, updates the active session window, executes model scoring, and returns real-time decision directives.
              </p>
              <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 overflow-x-auto">{`{
  "sessionId": "sess_1842",
  "userId": "usr_942",
  "event": {
    "eventType": "EVENT_VIEW",
    "entityId": "liverpool"
  }
}`}</pre>
            </div>

            <div className="p-4 rounded-xl glass-panel border border-slate-800">
              <div className="text-cyan-400 font-bold mb-2 flex items-center gap-1.5">
                <Code2 className="w-4 h-4" />
                <span>POST /api/v1/interventions/outcome</span>
              </div>
              <p className="text-slate-400 text-[11px] font-sans mb-3">
                Records acceptance or dismissal to adaptively calibrate fatigue rules and prevent repetitive user interruptions.
              </p>
              <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 overflow-x-auto">{`{
  "sessionId": "sess_1842",
  "outcome": "DISMISSED"
}`}</pre>
            </div>
          </div>
        </div>

        {/* 2. Production Evolution Section */}
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-mono font-bold text-xs">
              02
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Enterprise Production Evolution</h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30 font-bold">
                  ENTERPRISE ROADMAP
                </span>
              </div>
              <p className="text-xs text-slate-400">Target enterprise deployment for high-concurrency event ingestion</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-slate-800">
            <div className="font-mono text-xs text-slate-300 overflow-x-auto p-4 rounded-xl bg-slate-950 border border-slate-800">
              <pre>{`Client Events (FEG Mobile / Web Products)
      ↓
Kafka / Event Streaming Cluster
      ↓
Real-Time Feature Processing (Apache Flink / Spark Streaming)
      ↓
Redis / Feature Store (Feast / Hopsworks)
      ↓
Low-Latency Decision Service (Go / Rust / FastAPI)
      ↓
Model Serving (Triton / ONNX Runtime)
      ↓
Intervention Governor & Responsible Play Rules
      ↓
Client Gateway (Minimal Non-Coercive UX Delivery)

── ML Lifecycle & Governance ──
Databricks → Pipelines → MLflow Model Registry → Automated Canary Deployment

── Infrastructure & Observability ──
Azure AKS + OpenTelemetry Distributed Tracing + Prometheus / Grafana Monitoring`}</pre>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-indigo-400 font-bold">Kafka + Redis Store</span>
                <p className="text-slate-400 text-[11px] mt-1 font-sans">Distributed session buffer for tens of thousands of concurrent active journeys.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-indigo-400 font-bold">Databricks + MLflow</span>
                <p className="text-slate-400 text-[11px] mt-1 font-sans">Continuous offline model training, feature store registration, and drift detection.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-indigo-400 font-bold">Azure AKS + OpenTelemetry</span>
                <p className="text-slate-400 text-[11px] mt-1 font-sans">Zero-trust containerized execution with complete audit logging per decision.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
