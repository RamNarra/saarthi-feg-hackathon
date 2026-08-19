"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { BarChart3, TrendingUp, ShieldCheck, CheckCircle, Activity, Sparkles, AlertCircle } from "lucide-react";

export default function AnalyticsPage() {
  const [sampleSize, setSampleSize] = useState<number>(5000);

  // Synthetic benchmark A/B test data (Explicitly labeled)
  const abComparisonData = [
    { metric: "High-Value Session Rate", control: 28.4, treatment: 43.1, unit: "%" },
    { metric: "Friction Resolution Rate", control: 14.2, treatment: 68.7, unit: "%" },
    { metric: "Goal Completion Rate", control: 31.0, treatment: 49.5, unit: "%" },
    { metric: "Session Abandonment", control: 52.6, treatment: 31.2, unit: "%" },
  ];

  const frictionDistributionData = [
    { name: "Decision Hesitation", value: 34, color: "#38bdf8" },
    { name: "Information Overload", value: 26, color: "#818cf8" },
    { name: "Navigation Loop", value: 18, color: "#34d399" },
    { name: "Uncertainty / Dwell", value: 14, color: "#fbbf24" },
    { name: "Search Reformulation", value: 8, color: "#f43f5e" },
  ];

  const governorOutcomesData = [
    { name: "Do Nothing (Restraint)", percentage: 58, color: "#64748b" },
    { name: "Help Offered (Accepted)", percentage: 27, color: "#10b981" },
    { name: "Suppressed / Blocked", percentage: 9, color: "#f59e0b" },
    { name: "Help Offered (Dismissed)", percentage: 6, color: "#ef4444" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Product Analytics & A/B Simulator</h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Experimentation Engine
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Measuring session quality, friction resolution, and high-value outcomes across {sampleSize.toLocaleString()} simulated sessions.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-amber-400">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Illustrative Synthetic Benchmark</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <div className="text-xs font-mono uppercase text-slate-400">High-Value Sessions</div>
          <div className="mt-2 text-3xl font-bold text-cyan-400 font-mono">+51.7%</div>
          <div className="mt-1 text-xs text-slate-400 flex items-center gap-1 font-sans">
            <span className="text-emerald-400 font-semibold font-mono">43.1%</span> vs 28.4% Control
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <div className="text-xs font-mono uppercase text-slate-400">Friction Resolution</div>
          <div className="mt-2 text-3xl font-bold text-emerald-400 font-mono">68.7%</div>
          <div className="mt-1 text-xs text-slate-400 flex items-center gap-1 font-sans">
            Resolved without coercive prompts
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <div className="text-xs font-mono uppercase text-slate-400">Restraint / No-Intervention</div>
          <div className="mt-2 text-3xl font-bold text-slate-200 font-mono">58.0%</div>
          <div className="mt-1 text-xs text-slate-400 flex items-center gap-1 font-sans">
            Deliberate silence when no friction
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <div className="text-xs font-mono uppercase text-slate-400">Decision Latency</div>
          <div className="mt-2 text-3xl font-bold text-blue-400 font-mono">&lt; 1.2ms</div>
          <div className="mt-1 text-xs text-slate-400 flex items-center gap-1 font-sans">
            Edge-ready deterministic inference
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* A/B Test Benchmark Comparison */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase">A/B Test Simulator: Control vs Saarthi</h3>
              <p className="text-xs text-slate-400 mt-0.5">5,000 synthetic session sequences</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/20">
              p &lt; 0.001
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={abComparisonData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="metric" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="control" name="Control (Standard UX)" fill="#64748b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="treatment" name="Treatment (Saarthi)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Friction Distribution */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase">Detected In-Session Friction Types</h3>
              <p className="text-xs text-slate-400 mt-0.5">Classification Breakdown</p>
            </div>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={frictionDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {frictionDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(val: any) => [`${val}%`, "Share"]}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Governor Decisions Distribution Table */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800">
        <h3 className="text-sm font-bold text-white font-mono uppercase mb-3">Intervention Governor Outcome Split</h3>
        <p className="text-xs text-slate-400 mb-4">
          Demonstrating high precision and restraint: Saarthi triggers interventions only when expected utility exceeds confidence thresholds.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {governorOutcomesData.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 font-sans">{item.name}</div>
                <div className="text-2xl font-bold font-mono mt-1" style={{ color: item.color }}>
                  {item.percentage}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
