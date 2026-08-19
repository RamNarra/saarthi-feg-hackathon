module.exports=[58320,a=>{"use strict";var b=a.i(85024);a.s(["default",0,function(){return(0,b.jsxs)("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",children:[(0,b.jsxs)("div",{className:"border-b border-slate-800 pb-6 mb-8",children:[(0,b.jsxs)("div",{className:"flex items-center gap-2",children:[(0,b.jsx)("h1",{className:"text-2xl sm:text-3xl font-bold text-white tracking-tight",children:"System Architecture"}),(0,b.jsx)("span",{className:"text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",children:"Implemented vs Production"})]}),(0,b.jsx)("p",{className:"mt-1 text-sm text-slate-400",children:"Clear separation between the working Hackathon MVP and the production-scale enterprise roadmap."})]}),(0,b.jsxs)("div",{className:"space-y-12",children:[(0,b.jsxs)("div",{children:[(0,b.jsxs)("div",{className:"flex items-center gap-2.5 mb-4",children:[(0,b.jsx)("div",{className:"w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs",children:"01"}),(0,b.jsxs)("div",{children:[(0,b.jsxs)("div",{className:"flex items-center gap-2",children:[(0,b.jsx)("h2",{className:"text-xl font-bold text-white",children:"Implemented Hackathon MVP"}),(0,b.jsx)("span",{className:"text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-bold",children:"ACTIVE & DEPLOYED"})]}),(0,b.jsx)("p",{className:"text-xs text-slate-400",children:"Sub-millisecond real-time decision loop in Next.js 16 + React 19 + TypeScript"})]})]}),(0,b.jsxs)("div",{className:"p-6 rounded-2xl glass-panel border border-slate-800",children:[(0,b.jsx)("div",{className:"font-mono text-xs text-slate-300 overflow-x-auto p-4 rounded-xl bg-slate-950 border border-slate-800",children:(0,b.jsx)("pre",{children:`                 USER / DEMO SIMULATOR
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
        Session Outcome & Real-Time Analytics Trace`})}),(0,b.jsxs)("div",{className:"mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono",children:[(0,b.jsxs)("div",{className:"p-3 rounded-xl bg-slate-900 border border-slate-800",children:[(0,b.jsx)("span",{className:"text-cyan-400 font-bold",children:"Next.js 16 App Router"}),(0,b.jsx)("p",{className:"text-slate-400 text-[11px] mt-1 font-sans",children:"Full-stack React server & client architecture with Zod schema validation."})]}),(0,b.jsxs)("div",{className:"p-3 rounded-xl bg-slate-900 border border-slate-800",children:[(0,b.jsx)("span",{className:"text-emerald-400 font-bold",children:"Edge Feature Engine"}),(0,b.jsx)("p",{className:"text-slate-400 text-[11px] mt-1 font-sans",children:"Sequence extraction computing alternation, dwell time, and backtracks in <0.5ms."})]}),(0,b.jsxs)("div",{className:"p-3 rounded-xl bg-slate-900 border border-slate-800",children:[(0,b.jsx)("span",{className:"text-amber-400 font-bold",children:"Policy & Agency Guard"}),(0,b.jsx)("p",{className:"text-slate-400 text-[11px] mt-1 font-sans",children:"Responsible-play guardrails preventing fatigue and aggressive nudging."})]})]})]})]}),(0,b.jsxs)("div",{children:[(0,b.jsxs)("div",{className:"flex items-center gap-2.5 mb-4",children:[(0,b.jsx)("div",{className:"w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-mono font-bold text-xs",children:"02"}),(0,b.jsxs)("div",{children:[(0,b.jsxs)("div",{className:"flex items-center gap-2",children:[(0,b.jsx)("h2",{className:"text-xl font-bold text-white",children:"Production Evolution Architecture"}),(0,b.jsx)("span",{className:"text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30 font-bold",children:"ENTERPRISE ROADMAP"})]}),(0,b.jsx)("p",{className:"text-xs text-slate-400",children:"Target enterprise deployment for high-concurrency event ingestion"})]})]}),(0,b.jsxs)("div",{className:"p-6 rounded-2xl glass-panel border border-slate-800",children:[(0,b.jsx)("div",{className:"font-mono text-xs text-slate-300 overflow-x-auto p-4 rounded-xl bg-slate-950 border border-slate-800",children:(0,b.jsx)("pre",{children:`Client Events (Mobile / Web)
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
Azure AKS + OpenTelemetry Distributed Tracing + Prometheus / Grafana Monitoring`})}),(0,b.jsxs)("div",{className:"mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono",children:[(0,b.jsxs)("div",{className:"p-3 rounded-xl bg-slate-900 border border-slate-800",children:[(0,b.jsx)("span",{className:"text-indigo-400 font-bold",children:"Kafka + Redis Store"}),(0,b.jsx)("p",{className:"text-slate-400 text-[11px] mt-1 font-sans",children:"Distributed session buffer for tens of thousands of concurrent active journeys."})]}),(0,b.jsxs)("div",{className:"p-3 rounded-xl bg-slate-900 border border-slate-800",children:[(0,b.jsx)("span",{className:"text-indigo-400 font-bold",children:"Databricks + MLflow"}),(0,b.jsx)("p",{className:"text-slate-400 text-[11px] mt-1 font-sans",children:"Continuous offline model training, feature store registration, and drift detection."})]}),(0,b.jsxs)("div",{className:"p-3 rounded-xl bg-slate-900 border border-slate-800",children:[(0,b.jsx)("span",{className:"text-indigo-400 font-bold",children:"Azure AKS + OpenTelemetry"}),(0,b.jsx)("p",{className:"text-slate-400 text-[11px] mt-1 font-sans",children:"Zero-trust containerized execution with complete audit logging per decision."})]})]})]})]})]})]})}])}];

//# sourceMappingURL=app_architecture_page_tsx_19axqxz._.js.map