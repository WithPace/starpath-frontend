import type { ParsedSseEvent } from "@/lib/sse/parse-events";
import type { DashboardCard } from "@/stores/dashboard-store";

export type ModuleOutcome = {
  summaryText: string | null;
  cards: DashboardCard[];
  done: Record<string, unknown>;
  errorMessage: string | null;
};

function readCards(value: unknown): DashboardCard[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((card): card is DashboardCard => {
      if (!card || typeof card !== "object") return false;
      if (!("card_type" in card) || !("title" in card)) return false;
      return typeof card.card_type === "string" && typeof card.title === "string";
    })
    .map((card) => ({ ...card }));
}

function readSummaryText(events: ParsedSseEvent[]): string | null {
  const deltaText = events
    .filter((event) => event.event === "delta")
    .map((event) => event.data.text)
    .findLast((value): value is string => typeof value === "string" && value.trim().length > 0);

  if (deltaText) return deltaText;

  const doneText = events
    .filter((event) => event.event === "done")
    .map((event) => event.data.text)
    .findLast((value): value is string => typeof value === "string" && value.trim().length > 0);

  return doneText ?? null;
}

function readErrorMessage(events: ParsedSseEvent[]): string | null {
  const errorMessage = events
    .filter((event) => event.event === "error")
    .map((event) => event.data.message)
    .find((value): value is string => typeof value === "string" && value.trim().length > 0);

  return errorMessage ?? null;
}

export function extractModuleOutcome(events: ParsedSseEvent[]): ModuleOutcome {
  const deltaCards = events
    .filter((event) => event.event === "delta")
    .map((event) => readCards(event.data.cards))
    .find((cards) => cards.length > 0);

  const doneEvent = events.find((event) => event.event === "done");
  const doneCards = readCards(doneEvent?.data.cards);

  return {
    summaryText: readSummaryText(events),
    cards: deltaCards ?? doneCards,
    done: doneEvent?.data ?? {},
    errorMessage: readErrorMessage(events),
  };
}
