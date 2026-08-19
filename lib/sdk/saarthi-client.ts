import { SessionEvent, EventType } from "../types/events";
import { DecisionTrace, GovernorDecision, InterventionAction } from "../types/models";

export interface SaarthiClientConfig {
  endpoint?: string;
  apiKey?: string;
  sessionId: string;
  userId: string;
}

export interface SaarthiDecisionResponse {
  success: boolean;
  sessionId: string;
  eventId: string;
  sessionDepth: number;
  intent: {
    label: string;
    confidence: number;
  };
  friction: {
    label: string;
    confidence: number;
    signals: string[];
  };
  decision: {
    action: GovernorDecision;
    candidateAction?: InterventionAction;
    expectedHelpValue: number;
    payload?: any;
  };
  policy: {
    status: "ALLOWED" | "BLOCKED" | "SUPPRESSED";
    reason: string;
  };
  telemetry: {
    engineLatencyMs: number;
    apiLatencyMs: number;
    measuredAt: string;
  };
}

export interface SaarthiOutcomeResponse {
  success: boolean;
  sessionId: string;
  recordedOutcome: string;
  policyState: {
    cooldownActive: boolean;
    remainingInterventionBudget: number;
    dismissalCount: number;
  };
  timestamp: string;
}

export class SaarthiClient {
  private endpoint: string;
  private apiKey?: string;
  private sessionId: string;
  private userId: string;
  private localHistory: SessionEvent[] = [];

  constructor(config: SaarthiClientConfig) {
    this.endpoint = config.endpoint || "";
    this.apiKey = config.apiKey;
    this.sessionId = config.sessionId;
    this.userId = config.userId;
  }

  async trackEvent(
    eventType: EventType,
    entityId?: string,
    entityName?: string,
    metadata?: Record<string, unknown>
  ): Promise<SaarthiDecisionResponse> {
    const event = {
      eventType,
      entityId,
      entityName,
      timestamp: new Date().toISOString(),
      metadata: metadata || {},
    };

    const payload = {
      sessionId: this.sessionId,
      userId: this.userId,
      event,
      history: this.localHistory,
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    const res = await fetch(`${this.endpoint}/api/v1/session/events`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Saarthi decision API error: ${res.status} ${res.statusText}`);
    }

    const data: SaarthiDecisionResponse = await res.json();

    // Cache to client history for stateless robustness
    this.localHistory.push({
      id: data.eventId,
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: event.timestamp,
      eventType,
      entityId,
      entityName,
      metadata,
    });

    return data;
  }

  async recordOutcome(
    outcome: "ACCEPTED" | "DISMISSED" | "EXPIRED" | "IGNORED",
    feedback?: string
  ): Promise<SaarthiOutcomeResponse> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    const res = await fetch(`${this.endpoint}/api/v1/interventions/outcome`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        sessionId: this.sessionId,
        userId: this.userId,
        outcome,
        feedback,
      }),
    });

    if (!res.ok) {
      throw new Error(`Saarthi outcome API error: ${res.status}`);
    }

    const data: SaarthiOutcomeResponse = await res.json();
    return data;
  }
}

export function createSaarthiClient(config: SaarthiClientConfig): SaarthiClient {
  return new SaarthiClient(config);
}
