# Saarthi — Real-Time Session Intelligence & Friction Resolution
**FEG Innovation Hackathon 2026 — Challenge 1: Session Quality & User Conversion**

Saarthi understands what a user is trying to accomplish during a live session, identifies where that journey is getting stuck, and determines whether assistance would genuinely reduce friction. Instead of maximizing interactions, Saarthi chooses the smallest useful intervention — or deliberately does nothing.

## Core Features
- **Real-Time Session Feature Engine**: Tracks dwell time, backtracks, A⇄B alternation, and market switching in &lt;1ms.
- **Calibrated Intent & Friction Models**: Evaluates in-session intent and friction topologies.
- **Intervention Governor**: Deterministic policy layer outputting `HELP`, `WAIT`, or `DO_NOTHING`.
- **Responsible-Play Guardrails**: Zero dark patterns, adaptive fatigue suppression, and explicit restraint.
- **A/B Experiment Simulator**: Benchmarks High-Value Session Completion over 5,000 synthetic sessions.

## Project Structure
- `app/`: Next.js 16 App Router full-stack web application.
- `lib/engine/`: Real-time feature engine, intent & friction classifiers, policy guard, and governor.
- `ml/`: Synthetic sequence dataset generation and benchmark stats.
- `docs/`: FEG submission answers, architecture blueprint, responsible AI spec, and demo script.
- `tests/`: Automated unit test suite verifying all 4 demo scenarios.

## Quickstart
```bash
# Install dependencies
pnpm install

# Run unit test suite
pnpm test

# Build production bundle
pnpm build

# Start local server
pnpm dev
```
