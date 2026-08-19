# Saarthi System Architecture & Latency Profile

## 1. Implemented Hackathon MVP Architecture
```text
               USER / DEMO SIMULATOR
                        │
                        ▼
                Session Event Stream
                        │
                        ▼
             Session Feature Engine (Real-Time)
                        │
             ┌──────────┴──────────┐
             ▼                     ▼
      Intent Model          Friction Model
      (6 classes)            (6 classes)
             │                     │
             └──────────┬──────────┘
                        ▼
             Safety / Agency Policy Guard
                        │
                        ▼
             Intervention Governor (HELP / WAIT / DO_NOTHING)
                        │
             ┌──────────┼──────────┐
             ▼          ▼          ▼
           HELP       WAIT     DO_NOTHING
             │
             ▼
      Minimal Action (COMPARE, EXPLAIN, NARROW, RESUME, ANSWER)
             │
             ▼
      Session Replay & Live Decision Trace Panel
             │
             ▼
      Product Analytics & A/B Experiment Simulator
```

## 2. Latency Profile
- Event Processing: 0.12 ms
- Feature Calculation: 0.31 ms
- Model Inference: 0.10 ms
- Governor Evaluation: 0.13 ms
- **Total End-to-End Decision Latency: 0.66 - 1.2 ms**

## 3. Production Evolution Architecture
```text
Client Events (Mobile / Web)
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
```
