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
  anonKey?: string;
  timeoutMs?: number;
};

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export async function callOrchestrator(
  config: OrchestratorClientConfig,
  payload: OrchestratorPayload,
  fetchImpl: FetchLike = fetch,
): Promise<ParsedSseEvent[]> {
  const timeoutMs = config.timeoutMs ?? 60_000;
  const anonKey = config.anonKey?.trim() || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${config.accessToken}`,
  };

  if (anonKey) {
    headers.apikey = anonKey;
  }

  let response: Response;
  try {
    response = await fetchImpl(config.apiBaseUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (error) {
    const isAbortError = error instanceof DOMException && error.name === "AbortError";
    if (isAbortError) {
      throw new Error(`orchestrator request timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw new Error(`orchestrator request failed: ${response.status}`);
  }

  const raw = await response.text();
  return parseSseEvents(raw);
}
