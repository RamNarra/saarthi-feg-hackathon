import json
import random
import os

os.makedirs("ml/data", exist_ok=True)
os.makedirs("ml/artifacts", exist_ok=True)

ENTITIES = ["Arsenal", "Liverpool", "Manchester City", "Real Madrid", "Bayern Munich", "PSG", "Barcelona", "Inter Milan"]
SPORTS = ["Football", "Basketball", "Tennis", "Cricket"]

def generate_session(scenario_type, session_id):
    events = []
    t = 1787100000
    user_id = f"user_{random.randint(100, 999)}"
    
    events.append({
        "sessionId": session_id,
        "userId": user_id,
        "timestamp": f"2026-08-19T08:00:{len(events):02d}Z",
        "eventType": "SESSION_START"
    })
    
    if scenario_type == "smooth_research":
        team = random.choice(ENTITIES)
        events.append({"sessionId": session_id, "userId": user_id, "timestamp": f"2026-08-19T08:00:{len(events):02d}Z", "eventType": "EVENT_VIEW", "entityId": team.lower().replace(" ", "_"), "entityName": team})
        events.append({"sessionId": session_id, "userId": user_id, "timestamp": f"2026-08-19T08:00:{len(events):02d}Z", "eventType": "STATS_VIEW", "entityId": team.lower().replace(" ", "_")})
        events.append({"sessionId": session_id, "userId": user_id, "timestamp": f"2026-08-19T08:00:{len(events):02d}Z", "eventType": "MARKET_VIEW"})
        events.append({"sessionId": session_id, "userId": user_id, "timestamp": f"2026-08-19T08:00:{len(events):02d}Z", "eventType": "SAVE", "entityId": team.lower().replace(" ", "_")})
        label_intent = "RESEARCH"
        label_friction = "NONE"
        label_governor = "DO_NOTHING"
        
    elif scenario_type == "decision_hesitation_compare":
        team1, team2 = random.sample(ENTITIES, 2)
        events.append({"sessionId": session_id, "userId": user_id, "timestamp": f"2026-08-19T08:00:{len(events):02d}Z", "eventType": "EVENT_VIEW", "entityId": team1.lower().replace(" ", "_"), "entityName": team1})
        events.append({"sessionId": session_id, "userId": user_id, "timestamp": f"2026-08-19T08:00:{len(events):02d}Z", "eventType": "BACK"})
        events.append({"sessionId": session_id, "userId": user_id, "timestamp": f"2026-08-19T08:00:{len(events):02d}Z", "eventType": "EVENT_VIEW", "entityId": team2.lower().replace(" ", "_"), "entityName": team2})
        events.append({"sessionId": session_id, "userId": user_id, "timestamp": f"2026-08-19T08:00:{len(events):02d}Z", "eventType": "BACK"})
        events.append({"sessionId": session_id, "userId": user_id, "timestamp": f"2026-08-19T08:00:{len(events):02d}Z", "eventType": "EVENT_VIEW", "entityId": team1.lower().replace(" ", "_"), "entityName": team1})
        events.append({"sessionId": session_id, "userId": user_id, "timestamp": f"2026-08-19T08:00:{len(events):02d}Z", "eventType": "EVENT_VIEW", "entityId": team2.lower().replace(" ", "_"), "entityName": team2})
        label_intent = "COMPARE"
        label_friction = "DECISION_HESITATION"
        label_governor = "HELP"
        
    elif scenario_type == "information_overload":
        team = random.choice(ENTITIES)
        events.append({"sessionId": session_id, "userId": user_id, "timestamp": f"2026-08-19T08:00:{len(events):02d}Z", "eventType": "EVENT_VIEW", "entityId": team.lower().replace(" ", "_"), "entityName": team})
        for _ in range(5):
            events.append({"sessionId": session_id, "userId": user_id, "timestamp": f"2026-08-19T08:00:{len(events):02d}Z", "eventType": "MARKET_VIEW"})
            events.append({"sessionId": session_id, "userId": user_id, "timestamp": f"2026-08-19T08:00:{len(events):02d}Z", "eventType": "SCROLL", "metadata": {"depth": 85}})
        label_intent = "RESEARCH"
        label_friction = "INFORMATION_OVERLOAD"
        label_governor = "HELP"
        
    elif scenario_type == "navigation_loop":
        for _ in range(3):
            team = random.choice(ENTITIES)
            events.append({"sessionId": session_id, "userId": user_id, "timestamp": f"2026-08-19T08:00:{len(events):02d}Z", "eventType": "EVENT_VIEW", "entityId": team.lower().replace(" ", "_")})
            events.append({"sessionId": session_id, "userId": user_id, "timestamp": f"2026-08-19T08:00:{len(events):02d}Z", "eventType": "BACK"})
        label_intent = "DISCOVER"
        label_friction = "NAVIGATION"
        label_governor = "HELP"
        
    else:
        for _ in range(4):
            team = random.choice(ENTITIES)
            events.append({"sessionId": session_id, "userId": user_id, "timestamp": f"2026-08-19T08:00:{len(events):02d}Z", "eventType": "EVENT_VIEW", "entityId": team.lower().replace(" ", "_")})
        label_intent = "DISCOVER"
        label_friction = "NONE"
        label_governor = "DO_NOTHING"

    return {
        "sessionId": session_id,
        "events": events,
        "labels": {
            "intent": label_intent,
            "friction": label_friction,
            "governor": label_governor
        }
    }

def main():
    scenarios = ["smooth_research", "decision_hesitation_compare", "information_overload", "navigation_loop", "fluent_browse"]
    weights = [0.35, 0.25, 0.15, 0.10, 0.15]
    
    total = 5000
    dataset = []
    for i in range(total):
        sc = random.choices(scenarios, weights=weights)[0]
        dataset.append(generate_session(sc, f"sess_synth_{i:05d}"))
        
    with open("ml/data/synthetic_sessions_5000.json", "w") as f:
        json.dump(dataset, f, indent=2)
        
    # Generate stats summary
    friction_counts = {}
    intent_counts = {}
    for item in dataset:
        f = item["labels"]["friction"]
        in_ = item["labels"]["intent"]
        friction_counts[f] = friction_counts.get(f, 0) + 1
        intent_counts[in_] = intent_counts.get(in_, 0) + 1
        
    summary = {
        "total_sessions": total,
        "friction_distribution": friction_counts,
        "intent_distribution": intent_counts,
        "benchmark_type": "Illustrative synthetic benchmark",
        "generated_at": "2026-08-19T08:00:00Z"
    }
    
    with open("ml/artifacts/benchmark_stats.json", "w") as f:
        json.dump(summary, f, indent=2)
        
    print(f"Generated {total} synthetic session benchmarks -> ml/data/synthetic_sessions_5000.json")

if __name__ == "__main__":
    main()
