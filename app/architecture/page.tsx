"use client";

import { Layers, Server, Cloud, Cpu, ArrowRight, ShieldCheck, Database } from "lucide-react";

export default function ArchitecturePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">System Architecture</h1>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Implemented vs Production
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-400">
          Clear separation between the working Hackathon MVP and the production-scale enterprise roadmap.
        </p>
      </div>

      <div className="space-y-12">
        {/* 1. Implemented MVP Section */}
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs">
              01
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Implemented Hackathon MVP</h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-bold">
                  ACTIVE &amp; DEPLOYED
                </span>
              </div>
              <p className="text-xs text-slate-400">Sub-millisecond real-time decision loop in Next.js 16 + React 19 + TypeScript</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-slate-800">
            <div className="font-mono text-xs text-slate-300 overflow-x-auto p-4 rounded-xl bg-slate-950 border border-slate-800">
              <pre>{`                 USER / DEMO SIMULATOR
                          │
                          ▼
                  Session Event Stream (Zod validated)
                          │
                          ▼
               Session Feature Engine (Real-Time Window)
                          │
             ┌────────────┴────────────┐
             ▼                         ▼
      Session Intent            Friction Model
      (Softmax logit)          (Sequence Pattern)
             │                         │
             └────────────┬────────────┘
                          ▼
                   Safety / Agency
                     Policy Guard
                          │
                          ▼
                Intervention Governor
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
            HELP        WAIT     DO NOTHING
              │
              ▼
        Minimal Action (Side-by-side / Narrow / Resume)
              │
              ▼
        Session Outcome & Real-Time Analytics Trace`}</pre>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-cyan-400 font-bold">Next.js 16 App Router</span>
                <p className="text-slate-400 text-[11px] mt-1 font-sans">Full-stack React server &amp; client architecture with Zod schema validation.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-emerald-400 font-bold">Edge Feature Engine</span>
                <p className="text-slate-400 text-[11px] mt-1 font-sans">Sequence extraction computing alternation, dwell time, and backtracks in &lt;0.5ms.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-amber-400 font-bold">Policy &amp; Agency Guard</span>
                <p className="text-slate-400 text-[11px] mt-1 font-sans">Responsible-play guardrails preventing fatigue and aggressive nudging.</p>
              </div>
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
                <h2 className="text-xl font-bold text-white">Production Evolution Architecture</h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30 font-bold">
                  ENTERPRISE ROADMAP
                </span>
              </div>
              <p className="text-xs text-slate-400">Target enterprise deployment for high-concurrency event ingestion</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-slate-800">
            <div className="font-mono text-xs text-slate-300 overflow-x-auto p-4 rounded-xl bg-slate-950 border border-slate-800">
              <pre>{`Client Events (Mobile / Web)
      ↓
Kafka / Event Streaming
      ↓
Real-Time Feature Processing (Apache Flink / Spark Streaming)
      ↓
Redis / Feature Store (Feast / Hopsworks)
      ↓
Low-Latency Decision API (Go / Rust / FastAPI)
      ↓
Model Serving (Triton / ONNX Runtime)
      ↓
Intervention Governor & Responsible Play Rules
      ↓
Client Assistance Gateway

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
