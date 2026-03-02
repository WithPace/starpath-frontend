import { parseSseEvents, type ParsedSseEvent } from "../sse/parse-events";

type OrchestratorModule =
  | "chat_casual"
  | "assessment"
  | "training"
  | "training_advice"
  | "training_record"
  | "dashboard";

export type OrchestratorRole = "parent" | "doctor" | "teacher" | "org_admin";

export type OrchestratorPayload = {
  child_id: string;
  message: string;
  module: OrchestratorModule;
  role?: OrchestratorRole;
  request_id?: string;
  conversation_id?: string;
};

export type OrchestratorClientConfig = {
  apiBaseUrl: string;
  accessToken: string;
};

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export async function callOrchestrator(
  config: OrchestratorClientConfig,
  payload: OrchestratorPayload,
  fetchImpl: FetchLike = fetch,
): Promise<ParsedSseEvent[]> {
  const response = await fetchImpl(config.apiBaseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`orchestrator request failed: ${response.status}`);
  }

  const raw = await response.text();
  return parseSseEvents(raw);
}
