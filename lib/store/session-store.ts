import { SessionEvent } from "../types/events";

export interface SessionStateRecord {
  sessionId: string;
  userId: string;
  events: SessionEvent[];
  dismissalCount: number;
  acceptanceCount: number;
  lastOutcomeTimestamp?: string;
  cooldownActive: boolean;
  remainingInterventionBudget: number;
}

export interface ISessionStore {
  getEvents(sessionId: string): Promise<SessionEvent[]>;
  appendEvent(sessionId: string, userId: string, event: SessionEvent): Promise<SessionStateRecord>;
  recordOutcome(sessionId: string, userId: string, outcome: "ACCEPTED" | "DISMISSED" | "EXPIRED" | "IGNORED"): Promise<SessionStateRecord>;
  getSessionState(sessionId: string): Promise<SessionStateRecord | null>;
}

// In-Memory Implementation with LRU bounds and cooldown computation
class MemorySessionStore implements ISessionStore {
  private sessions = new Map<string, SessionStateRecord>();
  private readonly maxSessions = 5000;

  private getOrCreate(sessionId: string, userId: string): SessionStateRecord {
    let state = this.sessions.get(sessionId);
    if (!state) {
      if (this.sessions.size >= this.maxSessions) {
        const oldestKey = this.sessions.keys().next().value;
        if (oldestKey) this.sessions.delete(oldestKey);
      }
      state = {
        sessionId,
        userId,
        events: [],
        dismissalCount: 0,
        acceptanceCount: 0,
        cooldownActive: false,
        remainingInterventionBudget: 3,
      };
      this.sessions.set(sessionId, state);
    }
    return state;
  }

  async getEvents(sessionId: string): Promise<SessionEvent[]> {
    return this.sessions.get(sessionId)?.events || [];
  }

  async appendEvent(sessionId: string, userId: string, event: SessionEvent): Promise<SessionStateRecord> {
    const state = this.getOrCreate(sessionId, userId);
    state.events.push(event);
    return { ...state, events: [...state.events] };
  }

  async recordOutcome(
    sessionId: string,
    userId: string,
    outcome: "ACCEPTED" | "DISMISSED" | "EXPIRED" | "IGNORED"
  ): Promise<SessionStateRecord> {
    const state = this.getOrCreate(sessionId, userId);
    const now = new Date().toISOString();
    state.lastOutcomeTimestamp = now;

    if (outcome === "DISMISSED") {
      state.dismissalCount += 1;
      state.remainingInterventionBudget = Math.max(0, state.remainingInterventionBudget - 2);
      state.cooldownActive = state.dismissalCount >= 1;

      // Append explicit event to session timeline so future feature computations evaluate fatigue
      state.events.push({
        id: `ev_outcome_${Date.now()}`,
        sessionId,
        userId,
        timestamp: now,
        eventType: "INTERVENTION_DISMISSED",
        metadata: { feedback: "Dismissed by user - fatigue calibrated" },
      });
    } else if (outcome === "ACCEPTED") {
      state.acceptanceCount += 1;
      state.remainingInterventionBudget = Math.max(0, state.remainingInterventionBudget - 1);
      state.cooldownActive = false;

      state.events.push({
        id: `ev_outcome_${Date.now()}`,
        sessionId,
        userId,
        timestamp: now,
        eventType: "INTERVENTION_ACCEPTED",
        metadata: { action: "Intervention accepted and applied" },
      });
    }

    return { ...state, events: [...state.events] };
  }

  async getSessionState(sessionId: string): Promise<SessionStateRecord | null> {
    const s = this.sessions.get(sessionId);
    return s ? { ...s, events: [...s.events] } : null;
  }
}

// Global Singleton for application runtime
export const defaultSessionStore: ISessionStore = new MemorySessionStore();
