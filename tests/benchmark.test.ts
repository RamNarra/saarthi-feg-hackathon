import { describe, it, expect } from "vitest";
import { SessionEvent } from "../lib/types/events";
import { runInterventionGovernor } from "../lib/engine/governor";

describe("Latency & Performance Benchmark", () => {
  it("Runs 1,000 full decision loop cycles and computes empirical p50, p95, p99", () => {
    const events: SessionEvent[] = [
      { sessionId: "bench", userId: "u1", timestamp: "2026-08-19T08:00:00Z", eventType: "SESSION_START" },
      { sessionId: "bench", userId: "u1", timestamp: "2026-08-19T08:00:05Z", eventType: "EVENT_VIEW", entityId: "arsenal", entityName: "Arsenal" },
      { sessionId: "bench", userId: "u1", timestamp: "2026-08-19T08:00:10Z", eventType: "BACK" },
      { sessionId: "bench", userId: "u1", timestamp: "2026-08-19T08:00:15Z", eventType: "EVENT_VIEW", entityId: "liverpool", entityName: "Liverpool" },
      { sessionId: "bench", userId: "u1", timestamp: "2026-08-19T08:00:20Z", eventType: "BACK" },
      { sessionId: "bench", userId: "u1", timestamp: "2026-08-19T08:00:25Z", eventType: "EVENT_VIEW", entityId: "arsenal", entityName: "Arsenal" },
    ];

    // Warm-up
    for (let i = 0; i < 50; i++) {
      runInterventionGovernor(events);
    }

    const latencies: number[] = [];
    const N = 1000;
    for (let i = 0; i < N; i++) {
      const trace = runInterventionGovernor(events);
      latencies.push(trace.metrics.totalDecisionLatencyMs);
    }

    latencies.sort((a, b) => a - b);
    const p50 = latencies[Math.floor(N * 0.50)];
    const p95 = latencies[Math.floor(N * 0.95)];
    const p99 = latencies[Math.floor(N * 0.99)];

    console.log(`\n=== 1,000 RUN EMPIRICAL LATENCY BENCHMARK ===`);
    console.log(`p50: ${p50.toFixed(3)} ms`);
    console.log(`p95: ${p95.toFixed(3)} ms`);
    console.log(`p99: ${p99.toFixed(3)} ms`);

    expect(p50).toBeLessThan(2.0);
    expect(p99).toBeLessThan(5.0);
  });
});
